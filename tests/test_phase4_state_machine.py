from __future__ import annotations

import hashlib
import re

import pytest

from tests.test_phase4_redteam import (
    BASE_URL,
    CONTENT,
    _create_charter,
    _mock_yes,
    _prepare_case,
)


def _deploy(direct_deploy):
    return direct_deploy("contracts/charter_lock.py")


def _add_second_evidence(contract, case_id: str) -> str:
    content = b"A second independently bound bulletin."
    url = "https://www.example.com/archive/second"
    return contract.add_evidence(
        case_id,
        "authority-main",
        url,
        hashlib.sha256(content).hexdigest(),
        len(content),
        1_700_000_001,
        1_700_000_001,
    )


def test_charter_freeze_is_one_way(direct_deploy):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id, "authority-main", "PRIMARY", "www.example.com", "/archive", "Source", 1
    )
    frozen_hash = contract.freeze_charter(charter_id)
    frozen = contract.get_charter(charter_id)
    with pytest.raises(Exception):
        contract.add_authority_rule(
            charter_id, "authority-next", "SECONDARY", "news.example.com", "/archive", "Source", 2
        )
    with pytest.raises(Exception):
        contract.freeze_charter(charter_id)
    assert contract.get_charter(charter_id)["charter_hash"] == frozen_hash
    assert contract.get_charter(charter_id) == frozen


def test_open_requires_frozen_charter(direct_deploy):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    with pytest.raises(Exception):
        contract.open_case(charter_id)


def test_evidence_sealing_is_one_way(direct_deploy):
    contract = _deploy(direct_deploy)
    case_id, _, = _prepare_case(contract)
    before = contract.get_case(case_id)
    with pytest.raises(Exception):
        contract.seal_evidence(case_id)
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            "https://www.example.com/archive/late-entry",
            hashlib.sha256(b"late-entry").hexdigest(),
            len(b"late-entry"),
            1_700_000_001,
            1_700_000_001,
        )
    assert contract.get_case(case_id) == before


def test_adjudication_is_one_shot_for_a_frozen_generation(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    _mock_yes(direct_vm)
    resolution_id = contract.adjudicate(case_id)
    with pytest.raises(Exception):
        contract.adjudicate(case_id)
    assert contract.get_case(case_id)["active_resolution_id"] == resolution_id
    assert len(contract.get_resolution_history(case_id)) == 1


def test_challenge_requires_an_active_resolution(direct_deploy):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    with pytest.raises(Exception):
        contract.challenge(case_id, "PROCEDURAL_VIOLATION", "", "INVALID_STATE_TRANSITION")


def test_new_generation_preserves_lineage_and_supersedes_only_active_resolution(
    direct_deploy, direct_vm
):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    _mock_yes(direct_vm)
    first_resolution_id = contract.adjudicate(case_id)
    second_url = "https://www.example.com/archive/second"
    second_content = b"A second independently bound bulletin."
    direct_vm.mock_web(re.escape(second_url), {"status": 200, "body": second_content})
    second_evidence_id = contract.add_evidence(
        case_id,
        "authority-main",
        second_url,
        hashlib.sha256(second_content).hexdigest(),
        len(second_content),
        1_700_000_001,
        1_700_000_001,
    )
    challenge_id = contract.challenge(case_id, "NEW_ADMISSIBLE_EVIDENCE", second_evidence_id, "")
    second_resolution_id = contract.readjudicate(case_id)
    history = contract.get_resolution_history(case_id)
    assert [item["resolution_id"] for item in history] == [first_resolution_id, second_resolution_id]
    assert history[0]["status"] == "SUPERSEDED"
    assert history[0]["previous_resolution_id"] == ""
    assert history[1]["previous_resolution_id"] == first_resolution_id
    assert history[1]["challenge_id"] == challenge_id
    assert contract.get_case(case_id)["active_resolution_id"] == second_resolution_id


def test_generation_cap_is_terminal_for_challenges(direct_deploy, direct_vm):
    # max_challenge_generations=0 permits the base resolution but no challenge.
    # This is a direct check that the cap is enforced before challenge storage.
    # The helper's default is two, so create a fresh case with the zero cap.
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract, max_challenge_generations=0)
    contract.add_authority_rule(
        charter_id, "authority-main", "PRIMARY", "www.example.com", "/archive", "Source", 1
    )
    contract.freeze_charter(charter_id)
    zero_case = contract.open_case(charter_id)
    contract.add_evidence(
        zero_case,
        "authority-main",
        BASE_URL,
        hashlib.sha256(CONTENT).hexdigest(),
        len(CONTENT),
        1_700_000_000,
        1_700_000_000,
    )
    contract.seal_evidence(zero_case)
    _mock_yes(direct_vm)
    contract.adjudicate(zero_case)
    with pytest.raises(Exception):
        contract.challenge(zero_case, "PROCEDURAL_VIOLATION", "", "INVALID_STATE_TRANSITION")


def test_final_case_is_terminal_and_cannot_be_reopened(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract, challenge_window_seconds=1)
    _mock_yes(direct_vm)
    resolution_id = contract.adjudicate(case_id)
    direct_vm.warp("2035-01-01T00:00:00Z")
    contract.finalize_case(case_id)
    assert contract.get_case(case_id)["terminal"] is True
    assert contract.get_resolution(resolution_id)["status"] == "FINAL"
    with pytest.raises(Exception):
        contract.finalize_case(case_id)
    with pytest.raises(Exception):
        contract.challenge(case_id, "PROCEDURAL_VIOLATION", "", "INVALID_STATE_TRANSITION")


def test_ids_are_monotonic_and_never_reused(direct_deploy):
    contract = _deploy(direct_deploy)
    first = _create_charter(contract)
    second = _create_charter(contract)
    assert first == "CHR-00000001"
    assert second == "CHR-00000002"
    for charter_id in (first, second):
        contract.add_authority_rule(
            charter_id, "authority-main", "PRIMARY", "www.example.com", "/archive", "Source", 1
        )
        contract.freeze_charter(charter_id)
    assert contract.open_case(first) == "CASE-00000001"
    assert contract.open_case(second) == "CASE-00000002"
    assert contract.get_charter_ids() == [first, second]
    assert contract.get_case_ids() == ["CASE-00000001", "CASE-00000002"]


def test_evidence_index_is_append_only(direct_deploy):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id, "authority-main", "PRIMARY", "www.example.com", "/archive", "Source", 1
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    first = contract.add_evidence(
        case_id,
        "authority-main",
        BASE_URL,
        hashlib.sha256(CONTENT).hexdigest(),
        len(CONTENT),
        1_700_000_000,
        1_700_000_000,
    )
    second_content = b"Second content"
    second = contract.add_evidence(
        case_id,
        "authority-main",
        "https://www.example.com/archive/second",
        hashlib.sha256(second_content).hexdigest(),
        len(second_content),
        1_700_000_001,
        1_700_000_001,
    )
    assert contract.get_evidence_ids(case_id) == [first, second]
    assert contract.get_evidence(first)["evidence_id"] == first
    assert contract.get_evidence(second)["evidence_id"] == second


def test_evidence_root_changes_only_after_legal_new_evidence_generation(
    direct_deploy, direct_vm
):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    _mock_yes(direct_vm)
    contract.adjudicate(case_id)
    original_root = contract.get_case(case_id)["evidence_root"]
    second = _add_second_evidence(contract, case_id)
    assert contract.get_case(case_id)["evidence_root"] == original_root
    contract.challenge(case_id, "NEW_ADMISSIBLE_EVIDENCE", second, "")
    assert contract.get_case(case_id)["pending_evidence_root"] != original_root


def test_infrastructure_failure_never_becomes_business_outcome(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    direct_vm.mock_web(re.escape(BASE_URL), {"status": 404, "body": b""})
    resolution_id = contract.adjudicate(case_id)
    resolution = contract.get_resolution(resolution_id)
    assert resolution["canonical_state"] == "SOURCE_UNAVAILABLE"
    assert resolution["business_outcome"] == ""


def test_illegal_permutation_cannot_skip_seal_or_resurrect_case(direct_deploy):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id, "authority-main", "PRIMARY", "www.example.com", "/archive", "Source", 1
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    with pytest.raises(Exception):
        contract.adjudicate(case_id)
    with pytest.raises(Exception):
        contract.finalize_case(case_id)
    with pytest.raises(Exception):
        contract.readjudicate(case_id)
    assert contract.get_case(case_id)["state"] == "OPEN"
