+++
title = "Rust note #1: use Clippy"
datePublished = "2022-05-25"
+++

In the future there should be more of these notes, but this is the first. It's
just a thing I have learned about Rust in the past 2 years of using it.

Run [Clippy](https://crates.io/crates/clippy) against your Rust code to lint it
for common mistakes and improve your code. It's a great way to learn new things
about the language too.

I once wrote code like this...

```rust
let mut minifier_options = stylesheet::MinifyOptions::default();

minifier_options.targets = targets;
```

Clippy emitted a warning, "field assignment outside of initializer for an
instance created with Default::default()" and recommended I use
[struct update syntax](https://doc.rust-lang.org/book/ch05-01-defining-structs.html#creating-instances-from-other-instances-with-struct-update-syntax)
instead. So I changed the code to...

```rust
let minifier_options = stylesheet::MinifyOptions {
	targets,
	..stylesheet::MinifyOptions::default()
};
```

The great thing is that I did not even know about struct update syntax and now I
do.
