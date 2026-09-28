# Runner and source compatibility audit

Status: Phase 4 pre-deployment audit.

The source header remains the GenLayer v0.6 form:

```python
# { "Depends": "py-genlayer:latest" }
```

The installed matching family used for checks is `genlayer-py 0.19.0rc2`,
`genlayer-test 0.30.0rc2`, and `GenVM v0.6.0-rc2`. The contract subclasses
`gl.contract.Contract`, uses the v0.6 `gl.public.view` / `gl.public.write`
decorators, and declares storage fields with `gl.storage.TreeMap`,
`gl.storage.DynArray`, and the installed integer wrappers.

The source was checked with:

- `genvm-lint lint`: 3 checks passed.
- `genvm-lint typecheck`: zero errors, warnings, or information diagnostics.
- `genvm-lint validate --json`: `ok=true`.
- `genvm-lint schema`: 21 methods, 11 views, 10 writes, zero constructor
  parameters.
- Python compile: passed.
- Direct v0.6 test harness: 105 tests passed, including controlled
  nondeterministic web/LLM retrieval and captured validator closures.

The contract uses `gl.nondet.web.get(..., sign=True)` and
`gl.nondet.exec_prompt(..., response_format="json")` only inside the semantic
boundary. IDs, authority records, evidence records, deadlines, lifecycle
transitions, challenge limits, and finality remain deterministic state.

No constructor arguments, address conversion, payable path, deployment
source-parity proof, or live consensus claim is made here. Those require a
post-deployment qualification run against the exact deployed artifact.
