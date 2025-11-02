+++
title = "Rust note #2: return early sometimes"
datePublished = "2023-08-24"
+++

> The final expression in the function will be used as return value.
> Alternatively, the return statement can be used to return a value earlier from
> within the function, even from inside loops or if statements.
>
> — [Rust by Example](https://doc.rust-lang.org/rust-by-example/fn.html)

Sometimes you'll want to actually use `return` in your code to make it more
readable. It's only a matter of style, but consider the following examples. They
accomplish the same thing, but I think clearly one is the most succinct and
readable, one is ok, and one is clearly a very ugly option. I'll call them the
Good, Bad, and Ugly. Here listed in reverse.

## The Ugly

This is the worst option. Note all the else blocks all resulting in `url`.
That's a great deal of repetition, and nesting, and any programmer I think would
not be happy with this.

```rust
use camino::Utf8Path;
use std::fs;

pub fn asset_url(url: String) -> String {
	if url.starts_with('/') {
		if let Some(bare_url) = url.strip_prefix('/') {
			if let Ok(time) =
				fs::metadata(Utf8Path::new("theme")
					.join(bare_url))
					.and_then(|meta| meta.modified())
			{
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.unwrap();
				let cache_key = base62::encode(version_time);
				let path = Utf8Path::new(&url);
				let ext = path.extension().unwrap_or_default();

				path.with_extension(format!("{cache_key}.{ext}"))
					.to_string()
			} else {
				url
			}
		} else {
			url
		}
	} else {
		url
	}
}
```

## The Bad

This one is better. We've eliminated the nesting and the else statements.
Honestly this is fine. The problem I have with this is we're needlessly creating
a mutable variable, and when we get to our implicit return at the end we have to
remember that `url` is mutable, and find all the places where we mutated it to
see what the possibilities are.

```rust
use camino::Utf8Path;
use std::fs;

pub fn asset_url(url: String) -> String {
	let mut url = url;

	if url.starts_with('/') {
		if let Some(bare_url) = url.strip_prefix('/') {
			if let Ok(time) =
			fs::metadata(Utf8Path::new("theme")
				.join(bare_url))
				.and_then(|meta| meta.modified())
			{
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.unwrap();
				let cache_key = base62::encode(version_time);
				let path = Utf8Path::new(&url);
				let ext = path.extension().unwrap_or_default();

				url = path
					.with_extension(format!("{cache_key}.{ext}"))
					.to_string();
			}
		}
	};

	url
}
```

## The Good

This is my favorite, and again this is code style. For a long time I avoided
`return`. But in cases like this I think it's better to just return early and be
done with it. It is clear what is happening, and we don't have to think about a
mutable variable.

```rust
use camino::Utf8Path;
use std::fs;

pub fn asset_url(url: String) -> String {
	if url.starts_with('/') {
		if let Some(bare_url) = url.strip_prefix('/') {
			if let Ok(time) =
				fs::metadata(Utf8Path::new("theme")
					.join(bare_url))
					.and_then(|meta| meta.modified())
			{
				let version_time = time
					.duration_since(UNIX_EPOCH)
					.map(|d| d.as_secs())
					.unwrap();
				let cache_key = base62::encode(version_time);
				let path = Utf8Path::new(&url);
				let ext = path.extension().unwrap_or_default();

				return path
					.with_extension(format!("{cache_key}.{ext}"))
					.to_string();
			}
		}
	};

	url
}
```

Anyhow don't avoid using `return` at the cost of terseness and legibility.
Rust's feature of not requiring a return at the end sans-semicolon is cool, but
it's not always the best or only way.
