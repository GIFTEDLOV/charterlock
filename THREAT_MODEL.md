# CharterLock Protocol — Threat Model

## Assets

- frozen rule semantics and charter hash
- authority identity and URL binding
- evidence identity, byte length, timestamps, and snapshot root
- case lifecycle legality and challenge-generation limits
- resolution history and provenance lineage
- the distinction between business verdicts and infrastructure failures

## Trust boundaries

1. Callers submit charter fields, authority rules, and evidence metadata.
2. The deterministic contract validates and binds those fields.
3. External transport/evidence collection is bounded by the frozen authority
   rule and checked against committed digest/byte-length metadata in the
   validator execution path.
4. GenLayer validators independently evaluate only the bounded semantic
   question from the sealed admissible snapshot.
5. Read clients consume canonical contract state and must not infer state from
   UI guesses or transaction success alone.

## Threats and controls

| Threat | Control |
| --- | --- |
| post-exposure rule change | charter state and charter-critical writes are immutable after freeze |
| arbitrary authority injection | creator-only authority registration; strict class/hostname/path validation; evidence references registered authority IDs |
| URL confusion | HTTPS only, valid normalized hostname, no credentials/fragments/ports/control bytes, bounded path/query, exact path-prefix matching |
| duplicate evidence/challenge inflation | content fingerprint map, duplicate rejection, monotonic IDs, append-only records |
| late evidence | declared observed/publication time must be within the frozen evidence deadline; sealed cases reject additions |
| evidence mutation | evidence records are write-once and case snapshots are root-addressed |
| malformed digest | exactly 64 hexadecimal characters, canonical lowercase storage |
| prompt injection in evidence | evidence is data, not instructions; prompts delimit and explicitly ignore embedded instructions |
| validator result shopping | strict bounded result schema, custom semantic equivalence, independent evidence retrieval, and one-shot tuple keys |
| technical failure becoming `NO` | typed source/infrastructure statuses remain distinct from business outcomes |
| unauthorized lifecycle change | every write checks the exact current state and creator permissions where required |
| final-case reopening | terminal states have no outgoing mutation path |

## Known Phase 2 limitations

- Controlled direct-mode tests prove the leader/validator boundary and failure
  paths, but they are not a live Studio-dev consensus proof.
- A future release should add broader mutation testing and separately review
  production web-client redirect and timeout behavior against the deployed
  runner.

