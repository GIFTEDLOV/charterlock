# Live business-verdict fixture

This is a controlled live qualification fixture for the already deployed
CharterLock contract. It is not an organic production dispute and must not be
described as one.

## Frozen evidence identity

- Question: `Did IANA publish by the charter deadline that example.com and example.org are maintained for documentation purposes?`
- Authority: `iana-example-domains`
- Authority class: `OFFICIAL`
- Authority hostname: `www.iana.org`
- Authority path prefix: `/help/example-domains`
- Requested URL: `https://www.iana.org/help/example-domains`
- Effective URL: `https://www.iana.org/help/example-domains`
- Redirect chain: none observed
- HTTP status: `200 OK`
- Content type: `text/html; charset=utf-8`
- Raw SHA-256: `9adb74216b75a090d7b8764453146efc9480942bedc0616c5406a009a5a9c43e`
- Raw byte length: `6661`
- Fetch timestamp: `2026-09-29T07:29:07.090Z`
- Temporal mode: `OFFICIAL_CONFIRMATION_BY_DEADLINE`

The fetched page contains the statement that domains such as `example.com`
and `example.org` are maintained for documentation purposes. The page also
reports a last-revised date of `2026-09-27`, which is before the qualification
charter deadline. The evidence record will preserve that publication timestamp
as `2026-09-27T00:00:00Z` and the observed timestamp from the qualification
fetch, subject to the contract's timestamp bounds.

The source is admissible because the effective HTTPS URL remains on the frozen
official hostname and path prefix, the response was fetched before committing
the identity, and the exact raw bytes are represented by the digest and length
above. Validators, rather than local code, determine whether the source is
available and how the bounded semantic vector is produced.

Expected interpretation if validators can independently retrieve and verify
the same evidence is a sufficient official confirmation for the stated fact;
the canonical business outcome remains whatever the contract derives from the
consensus semantic vector. `SOURCE_UNAVAILABLE` or `INCONCLUSIVE` will not be
reinterpreted as `YES` or `NO`.

## Scope disclaimer

This document records one controlled live business-verdict qualification. It
does not establish an organic production dispute, does not authorize another
deployment, and does not claim browser-wallet qualification. The previous
GitHub-fixture `SOURCE_UNAVAILABLE` history remains preserved in
`LIVE_QUALIFICATION.md`.
