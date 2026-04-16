# quackmantics

A minimal duck-themed Semantle-style word game.

## Run

Open `/home/runner/work/quackmantics/quackmantics/index.html` in a browser.

## URL secret words

You can pass a custom secret in the URL as `?secret=<ENCODED_WORD>` using a Vigenère cipher with key `QUACK`.

Example:

```text
index.html?secret=TOCM
```

`TOCM` decodes to `duck`.
