+++
title = "Rust note #2: use truncate with File::options"
datePublished = "2023-04-05"
+++

While running
[coolstyleserver](https://github.com/erickmerchant/coolstyleserver/) and working
on the CSS for this site I came across a strange issue. I'd save a CSS file and
occasionally — but not always! — my changes would result in a broken file. I
would get a console error about a missing bracket or some other strange thing.

Now on the server I am doing something possibly naive. I am compiling CSS with
[Lightning CSS](https://lightningcss.dev/) and then caching the result to a
file, so on subsequent requests the compiled file is cached and I just serve
that. In dev I'm always running Lightning CSS, but I'm still writing to the file
and serving that.

So turns out if you open a file for writing in Rust using `std::File::options()`
it will not truncate the file. This means if you open a file for writing and
then write to it, it will just replace the contents up to the length of your new
content, but leave old content after that. This is not what I wanted obviously.
I wanted to truncate the file and write to it. So I had to do this:

```rust
let mut file = File::options()
	.read(true) // this is why I can't use File::create()
	.write(true)
	.create(true)
	.truncate(true)
	.open(&src)?;

file.write_all(my_content)?;
```

Note also if you use `std::fs::write` or `std::fs::File::create` with
`std::io::prelude::write_all` it will truncate the file for you.
