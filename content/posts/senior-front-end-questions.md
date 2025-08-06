+++
title = "Questions to ask a senior front-end developer"
datePublished = "2024-10-23"
+++

I saw someone ask about interview questions the other day for a senior front-end
engineer. I've never interviewed anyone really, but I've thought about this a
bit over the years and have a very short list of questions ready to go if I had
too. Presumably this would just be the start and there would also be questions
about sprints and communication and all that stuff too. These are some question
I'd ask really at any level. More senior I'd say almost just assume people know
some of these things or can look it up if needed. I've gotten some of them in
the past but made most of them up. Also by the way I'm not giving the answer
here in every case, but rather just some explanation of why I'd ask it, but
maybe I should.

- Can you tell me about a time where you encountered a race condition, or
  imagine how one might occur?

This one I feel is important for async programming. JavaScript is nearly all
async. Whether it's with event handlers, server functions, callbacks, or
promises. You'd be surprised how many bugs I've fixed over the years because
some code wasn't accounting for the non-deterministic order that fetch calls can
return in for instance.

- What is specificity and how do you approach managing it?

I feel like the biggest challenge with CSS and scaling it is specificity. There
are a few ways to address this like atomic CSS or BEM. If you're writing CSS you
probably have an opinion.

- What is a memory leak and an example of how one can occur?

Many of us have never encountered a memory leak, but it's good to be aware of
them and find them before they're a problem.

- Can you explain at a very high level what happens when you enter an address
  into your browser and hit enter?

The most basic stuff, and this question has many valid answers. I wouldn't be
looking for a ton of detail here. If the answer mentions DNS that's bonus.

- Talk about HTTP status codes and what they're used for? Give some examples.

100s are informational, 200s success, 300s redirects, 400s user errors, 500s
server errors. 405 method not allowed

- Button vs anchor. When do you use one versus the other?

Are they going to create basic accessibility mistakes. I'm not an accessibility
expert, but at the very least I think we should use the right elements.

- How do you measure and optimize for performance?

The answer is Ligthouse. If it's something else I feel like they probably are an
expert here.

- What is color contrast?

Another basic accessibility thing that touches on design too. Accessibility is
in such a poor state on the web that it's worth it to throw in a few questions
about it.
