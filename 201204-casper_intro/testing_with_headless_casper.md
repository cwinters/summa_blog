# Testing with CasperJS

CasperJS is a library that makes it easier to manipulate the
headless WebKit browser provided by PhantomJS. It's similar to
other [web automation libraries][wwwmech] in terms of making easy
things easy, but it adds useful twists by both enabling
automation in JavaScript, and actually automating an instance of
a web browser. This post will briefly introduce how you can use
Casper to test your dynamic application.

## Quick example

This example is on [github][samplerepo] and can be used without a
webserver. It has a simple form with:

* sections that are conditionally displayed,
* 

One note -- if you're using Chrome you need to start it like
this:

    google-chrome --allow-file-access-from-files
    
Otherwise the AJAX calls won't be able to load the static JSON
files (see [#40787][chromefile]).

First a quick example of a test:

- what are some good examples? create/download a simple todo-list
  application? Maybe re-use notem?

## Pros and cons of single programming environment

### Moving data from browser to test: easy

- Give example of JS in browser that we can use and query
  directly
- NB: cannot return references to 'live' browser resources (e.g.,
  nodes in the DOM, 'window', 'document', etc.) [test out Date?]

### Easy to forget the sandbox

- Easy to forget that you cannot create a simple JS closure to
  execute in the browser; references to your test scope objects
  will be lost
- Casper provides a clever (if hacky) way of doing so; a version
  tied to Phantom 1.6 will be able to execute code directly (!!)

## Useful types of testing

- Don't duplicate testing elsewhere. For example, modern web
  applications have pretty robust means of testing many layers of
  your application without using a browser at all. Don't
  duplicate them, concentrate on functionality that's in the
  browser only.

- Don't use this to test non-web libraries; use something like
  jsprove, whatever

## vs Selenium

+ headless operation
+ easy setup
+ single environment (see above)

- only webkit
- relatively immature and unsupported


[chromefile] http://code.google.com/p/chromium/issues/detail?id=40787
[samplerepo] https://github.com/cwinters/exercise/tree/master/casperjs/summa_example
[wwwmech] http://search.cpan.org/search?query=www%3A%3Amechanize&mode=dist
