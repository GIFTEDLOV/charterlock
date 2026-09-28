from __future__ import annotations

import hashlib
import json
import re

import pytest

from charterlock.semantic import validate_binary_event_result


CONTENT = b"The official bulletin records the declared event."
BASE_URL = "https://www.example.com/archive/event"


def _deploy(direct_deploy):
    return direct_deploy("contracts/charter_lock.py")


def _create_charter(contract, **overrides):
    values = {
        "schema_version": "BINARY_EVENT_V1",
        "domain": "event-contract-resolution",
        "question": "Did the declared event occur by the frozen deadline?",
        "allowed_outcomes": json.dumps(["YES", "NO"]),
        "event_deadline": 1_800_000_000,
        "evidence_deadline": 1_800_000_600,
        "temporal_semantics": "OCCURRENCE_BY_DEADLINE",
        "authority_policy": "REGISTERED_AUTHORITY_REQUIRED",
        "source_policy": "BOUND_HOSTNAME_AND_PATH",
        "min_corroboration": 1,
        "conflict_policy": "CONFLICT_INCONCLUSIVE",
        "unavailable_source_policy": "UNAVAILABLE_INCONCLUSIVE",
        "challenge_window_seconds": 3_600,
        "max_challenge_generations": 2,
    }
    values.update(overrides)
    return contract.create_charter(**values)


def _prepare_case(
    contract,
    *,
    temporal_semantics: str = "OCCURRENCE_BY_DEADLINE",
    authority_class: str = "PRIMARY",
    challenge_window_seconds: int = 3_600,
):
    charter_id = _create_charter(
        contract,
        temporal_semantics=temporal_semantics,
        challenge_window_seconds=challenge_window_seconds,
    )
    contract.add_authority_rule(
        charter_id,
        "authority-main",
        authority_class,
        "www.example.com",
        "/archive",
        "Frozen source",
        1,
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    evidence_id = contract.add_evidence(
        case_id,
        "authority-main",
        BASE_URL,
        hashlib.sha256(CONTENT).hexdigest(),
        len(CONTENT),
        1_700_000_000,
        1_700_000_000,
    )
    contract.seal_evidence(case_id)
    return case_id, evidence_id


def _mock_yes(direct_vm, url: str = BASE_URL):
    direct_vm.mock_web(re.escape(url), {"status": 200, "body": CONTENT})
    direct_vm.mock_llm(
        ".*",
        json.dumps(
            {
                "selected_outcome": "YES",
                "event_occurred": True,
                "event_before_deadline": True,
                "confirmation_before_deadline": True,
                "authority_requirement_met": True,
                "corroboration_requirement_met": True,
                "evidence_conflict": False,
                "evidence_sufficient": True,
            }
        ),
    )


@pytest.mark.parametrize(
    "url",
    [
        "https://www.example.com/archive/../other",
        "https://www.example.com/%2e%2e/other",
        "https://www.example.com/archive/%2Fprotected",
        "https://www.example.com/archive/%00",
        "https://www.example.com//protected",
    ],
)
def test_ambiguous_path_transport_is_rejected(direct_deploy, url):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id,
        "authority-main",
        "PRIMARY",
        "www.example.com",
        "/archive",
        "Frozen source",
        1,
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            url,
            hashlib.sha256(CONTENT).hexdigest(),
            len(CONTENT),
            1_700_000_000,
            1_700_000_000,
        )


def test_official_temporal_mode_requires_official_authority(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(
        contract,
        temporal_semantics="OFFICIAL_CONFIRMATION_BY_DEADLINE",
        authority_class="PRIMARY",
    )
    _mock_yes(direct_vm)
    with pytest.raises(Exception):
        contract.adjudicate(case_id)
    assert contract.get_case(case_id)["state"] == "EVIDENCE_SEALED"


def test_same_content_cannot_be_reintroduced_through_new_transport(direct_deploy):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            "https://www.example.com/archive/other-location",
            hashlib.sha256(CONTENT).hexdigest(),
            len(CONTENT),
            1_700_000_001,
            1_700_000_001,
        )


def test_procedural_challenges_require_bounded_reason_code(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract)
    _mock_yes(direct_vm)
    contract.adjudicate(case_id)
    with pytest.raises(Exception):
        contract.challenge(case_id, "PROCEDURAL_VIOLATION", "", "arbitrary prose")
    challenge_id = contract.challenge(
        case_id,
        "PROCEDURAL_VIOLATION",
        "",
        "SEMANTIC_BOUNDARY_VIOLATION",
    )
    assert challenge_id == "CHAL-00000001"


def test_evidence_cannot_be_registered_after_challenge_window(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    case_id, _ = _prepare_case(contract, challenge_window_seconds=1)
    _mock_yes(direct_vm)
    contract.adjudicate(case_id)
    direct_vm.warp("2035-01-01T00:00:00Z")
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            "https://www.example.com/archive/late",
            hashlib.sha256(b"late evidence").hexdigest(),
            len(b"late evidence"),
            1_700_000_000,
            1_700_000_000,
        )


def test_semantic_helper_rejects_technical_state_as_selected_outcome():
    value = {
        "selected_outcome": "SOURCE_UNAVAILABLE",
        "event_occurred": False,
        "event_before_deadline": False,
        "confirmation_before_deadline": False,
        "authority_requirement_met": False,
        "corroboration_requirement_met": False,
        "evidence_conflict": False,
        "evidence_sufficient": False,
    }
    with pytest.raises(ValueError):
        validate_binary_event_result(json.dumps(value))


@pytest.mark.parametrize(
    "raw",
    [
        '{"selected_outcome":"YES","selected_outcome":"NO","event_occurred":true,"event_before_deadline":true,"confirmation_before_deadline":true,"authority_requirement_met":true,"corroboration_requirement_met":true,"evidence_conflict":false,"evidence_sufficient":true}',
        '{"selected_outcome":"YES","event_occurred":true,"event_before_deadline":true,"confirmation_before_deadline":true,"authority_requirement_met":true,"corroboration_requirement_met":true,"evidence_conflict":false,"evidence_sufficient":true,"event_оccurred":true}',
        '{"selected_outcome":"YES","event_occurred":true,"event_before_deadline":true,"confirmation_before_deadline":true,"authority_requirement_met":true,"corroboration_requirement_met":true,"evidence_conflict":false,"evidence_sufficient":true} NaN',
        '```json\n{"selected_outcome":"YES"}\n```',
    ],
)
def test_semantic_parser_rejects_duplicate_lookalike_and_non_json_payloads(raw):
    with pytest.raises(ValueError):
        validate_binary_event_result(raw)


@pytest.mark.parametrize(
    "url",
    [
        "https://trusted.com.evil.com/",
        "https://evil.com/?trusted.com",
        "https://trusted.com@evil.com/",
        "https://evil.com@trusted.com/",
        "https://TRUSTED.COM/",
        "https://trusted.com./",
        "https://trusted.com:443/",
        "https://trusted.com:444/",
        "https://trusted.com/path/../other",
        "https://trusted.com/%2e%2e/other",
        "https://trusted.com/%2Fprotected",
        "https://trusted.com//protected",
        "https://trusted.com/%00",
        "https://trusted.com/\n",
        "https://trusted.com/#fragment",
        "https://user:pass@trusted.com/",
    ],
)
def test_url_confusion_inputs_do_not_bypass_frozen_authority(direct_deploy, url):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id,
        "authority-main",
        "PRIMARY",
        "trusted.com",
        "/protected",
        "Frozen source",
        1,
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            url,
            hashlib.sha256(CONTENT).hexdigest(),
            len(CONTENT),
            1_700_000_000,
            1_700_000_000,
        )


def test_evidence_deadline_boundaries_are_explicit(direct_deploy):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id,
        "authority-main",
        "PRIMARY",
        "www.example.com",
        "/archive",
        "Frozen source",
        1,
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    deadline = 1_800_000_600
    exact_id = contract.add_evidence(
        case_id,
        "authority-main",
        BASE_URL,
        hashlib.sha256(CONTENT).hexdigest(),
        len(CONTENT),
        deadline,
        deadline,
    )
    assert exact_id == "EVID-00000001"
    with pytest.raises(Exception):
        contract.add_evidence(
            case_id,
            "authority-main",
            "https://www.example.com/archive/late",
            hashlib.sha256(b"late").hexdigest(),
            4,
            deadline + 1,
            deadline + 1,
        )


def test_query_transport_cannot_escape_on_redirect(direct_deploy, direct_vm):
    contract = _deploy(direct_deploy)
    charter_id = _create_charter(contract)
    contract.add_authority_rule(
        charter_id,
        "authority-main",
        "PRIMARY",
        "trusted.com",
        "/protected",
        "Frozen source",
        1,
    )
    contract.freeze_charter(charter_id)
    case_id = contract.open_case(charter_id)
    query_url = "https://trusted.com/protected?redirect=https://evil.com"
    contract.add_evidence(
        case_id,
        "authority-main",
        query_url,
        hashlib.sha256(CONTENT).hexdigest(),
        len(CONTENT),
        1_700_000_000,
        1_700_000_000,
    )
    contract.seal_evidence(case_id)
    direct_vm.mock_web(
        re.escape(query_url),
        {
            "response": {
                "status": 200,
                "headers": {"location": "https://evil.com/archive/event"},
                "body": CONTENT,
            }
        },
    )
    resolution = contract.get_resolution(contract.adjudicate(case_id))
    assert resolution["canonical_state"] == "AUTHORITY_MISMATCH"
    assert resolution["business_outcome"] == ""
