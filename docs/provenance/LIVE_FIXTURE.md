# Studio-dev live qualification fixtures

These are the exact public HTTPS evidence objects selected for the deployed
CharterLock `BINARY_EVENT_V1` qualification. The bytes were fetched locally
before admission and preserved outside the repository at
`C:\Users\DELL\CharterLock-live-fixtures`.

## Frozen semantic question

Did an official GenLayer Labs repository publish documentation describing a
GenLayer developer artifact by the event deadline?

The qualification charter uses `OFFICIAL_CONFIRMATION_BY_DEADLINE`,
`REGISTERED_AUTHORITY_REQUIRED`, `BOUND_HOSTNAME_AND_PATH`, and minimum
corroboration of one. Both fixtures were admitted as distinct, admissible
objects. Studio-dev validators returned `SOURCE_UNAVAILABLE` for both live
generations, so this qualification does not claim a business `YES` or `NO`.

## Evidence object 1

- Authority: `genlayerlabs/genlayer-studio` official repository
- Authority class: `OFFICIAL`
- Immutable source commit: `c94072951e483510329670aa427fba3fa6944f45`
- URL: `https://raw.githubusercontent.com/genlayerlabs/genlayer-studio/c94072951e483510329670aa427fba3fa6944f45/README.md`
- Authority hostname: `raw.githubusercontent.com`
- Authority path prefix: `/genlayerlabs/genlayer-studio/`
- SHA-256: `d2496077087a1a272c53852c5834a32e33472d58be8a7a80cce6487ad5fe884d`
- Exact UTF-8 byte length: `3689`
- Admissibility: official GenLayer Labs repository, immutable commit-pinned raw
  URL, HTTPS host/path binding, and exact digest/length commitment.

## Evidence object 2

- Authority: `genlayerlabs/genlayer-js` official repository
- Authority class: `OFFICIAL`
- Immutable source commit: `1b7f50a3a3f2963ea857941b0fb386081dd5c326`
- URL: `https://raw.githubusercontent.com/genlayerlabs/genlayer-js/1b7f50a3a3f2963ea857941b0fb386081dd5c326/README.md`
- Authority hostname: `raw.githubusercontent.com`
- Authority path prefix: `/genlayerlabs/genlayer-js/`
- SHA-256: `51b6b9ec267e8f09d5378c5ca066c6a9e1e586744299746e1d6705e9aeead3eb`
- Exact UTF-8 byte length: `14760`
- Admissibility: separate official GenLayer Labs repository, immutable
  commit-pinned raw URL, HTTPS host/path binding, and distinct exact
  digest/length commitment. It is not a duplicate of fixture 1.

The fixture identity was committed before the live `add_evidence` calls. No
fixture bytes were edited after hashing. Live observations were recorded as
`published_at=0` and `observed_at=1790634409` for fixture 1 and
`observed_at=1790634607` for fixture 2. Both evidence records were read back
as `ADMISSIBLE`; the first resolution was `SOURCE_UNAVAILABLE` /
`INCONCLUSIVE`, and the second materially-new fixture created the distinct
evidence root used by the genuine challenge/readjudication generation.
