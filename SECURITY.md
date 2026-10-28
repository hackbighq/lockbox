# Using the attacks responsibly

The scripts in `attacks/` exist to break **this** app, running on **your own machine**,
so you can watch each weakness and then fix it. That is the whole point of the episode.

- Only ever point them at your own `http://localhost:8787` Lockbox. They default to localhost.
- The accounts and passwords in `src/seed.ts` are invented for the demo. None are real.
- Do not run these, or anything like them, against a system you do not own or operate.
  Probing someone else's login, stealing their database, replaying their cookies or
  brute-forcing their accounts is illegal in most places and is never OK.

If you find a real security problem in this repository itself, open an issue describing it.
