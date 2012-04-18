# JavaScript gotcha: scoping and loops

(or: one way to wield immediately-invoked function expressions)

JavaScript has some *interesting* scoping rules. One of them is
that variables are scoped to functions rather than blocks. This
sounds simple but it can have some pretty serious consequences.

Say we're transforming an from an array of arbitrary objects into
a simple JavaScript object. In this case, each item in the array
maps to key/value pair, where the key is its 1-based array index
and the value is a function which just returns the original array
value. Here's a first attempt:

    function createMapped_1( items ) {
        var mapped = {};
        for ( var i = 1; i <= items.length; i++ ) {
            mapped[i] = function() { return items[i-1] };
            print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
        }
        print( "Last index is: " + i );
        return mapped;
    }
    
    function showMapped( map ) {
        for ( var key in map ) {
            print( "Extracted [Key: " + key + "] [Result: " + map[ key ]() + "]" );
        }
    }
    
    var birds = [ 'owl', 'robin', 'eagle', 'sparrow', 'falcon' ];
    showMapped( createMapped_1( birds ) );

Executing this you'd expect both sets of output to
match. Instead, you get:

    Mapped    [Key: 1] [Result: owl]
    Mapped    [Key: 2] [Result: robin]
    Mapped    [Key: 3] [Result: eagle]
    Mapped    [Key: 4] [Result: sparrow]
    Mapped    [Key: 5] [Result: falcon]
    Last index is: 6
    Extracted [Key: 1] [Result: undefined]
    Extracted [Key: 2] [Result: undefined]
    Extracted [Key: 3] [Result: undefined]
    Extracted [Key: 4] [Result: undefined]
    Extracted [Key: 5] [Result: undefined]

Not only is that wrong, but in many languages you'd get a
compilation error because the variable `i` wouldn't be visible
outside the scope of the surrounding block (the `for` loop). For
example, here's a simple Java class to demonstrate:

    public class OutsideBlock {
        public static void main( String... args ) {
            for ( int i = 0; i < 5; i++ ) {
                System.out.println( "In loop: " + i );
            }
            System.out.println( "Out of loop: " + i );
        }
    }

Compiling this gives:

    $ javac OutsideBlock.java 
    OutsideBlock.java:6: cannot find symbol
    symbol  : variable i
    location: class OutsideBlock
            System.out.println( "Out of loop: " + i );
                                                  ^
    1 error

And a similar Perl program in strict mode...

    use strict;
    
    print( "In loop: $i\n" ) for my $i ( 0..4 );
    print( "Out of loop: $i\n" );

...gives a similar complaint:

    $ perl outside_block.pl 
    Global symbol "$i" requires explicit package name at outside_block.pl line 5.
    syntax error at outside_block.pl line 5, near "$i ( "
    Execution of outside_block.pl aborted due to compilation errors.

Instead in JavaScript we get the last value of `i` that failed
the loop's conditional test. This is a glimpse at the functional
vs.  block scope that winds up biting us.

But back to our basic question: why does the closure that gets
executed __within__ `createMapped_1()` not return the same value
as the same closure that gets executed __outside__
`createMapped_1()`?

What if we rewrote the function to assign the indexed value 
from `items`  __outside__ the closure? Such as this:

    function createMapped_2( items ) {
        var mapped = {};
        for ( var i = 1; i <= items.length; i++ ) {
            var value = items[i-1];
            mapped[i] = function() { return value };
            print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
        }
        print( "Last index is: " + i );
        return mapped;
    }

Running it we get:

    Mapped    [Key: 1] [Result: owl]
    Mapped    [Key: 2] [Result: robin]
    Mapped    [Key: 3] [Result: eagle]
    Mapped    [Key: 4] [Result: sparrow]
    Mapped    [Key: 5] [Result: falcon]
    Last index is: 6
    Extracted [Key: 1] [Result: falcon]
    Extracted [Key: 2] [Result: falcon]
    Extracted [Key: 3] [Result: falcon]
    Extracted [Key: 4] [Result: falcon]
    Extracted [Key: 5] [Result: falcon]

Different, but still wrong. The cause in both our initial attempt
and this one is the same, just with a different mask. The output
gives us a hint as to the cause -- 'falcon' is the last element
of the array -- but let's make it more explicit and rephrase the
function to reflect how JavaScript scoping rules work:

    function createMapped_3( items ) {
        var mapped = {};
        var i;
        var value;
        for ( i = 1; i <= items.length; i++ ) {
            value = items[i-1];
            mapped[i] = function() { return value };
            print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
        }
        print( "Last index is: " + i );
        return mapped;
    }

From that it's apparent that both the variables `i` and `value`
aren't scoped to the loop, but instead they're overwritten for
every iteration through the loop. So the closure just reflects
the most recent value assigned, which is why it returns the last
member of the array.

This also explains why in our first attempt we just got
`undefined`: the value of `i` outside the loop is `6`, and
there's no item at array index 6 which is why the closure returns
`undefined`.

OK, fine: how do we fix it? This is where the
__immediately-invoked function expression__ comes in. We're going
to create a function that returns a function, and then
immediately execute the first. So what happens if we wrap our
first attempt's loop code with an IIFE? Here's what it looks
like:

    function createMapped_4( items ) {
        var mapped = {};
        for ( var i = 1; i <= items.length; i++ ) {
            (function() {
                mapped[i] = (function() { return function() { return items[i-1] } })();
                print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
            })();
        }
        print( "Last index is: " + i );
        return mapped;
    }

And the output:

    Mapped    [Key: 1] [Result: owl]
    Mapped    [Key: 2] [Result: robin]
    Mapped    [Key: 3] [Result: eagle]
    Mapped    [Key: 4] [Result: sparrow]
    Mapped    [Key: 5] [Result: falcon]
    Last index is: 6
    Extracted [Key: 1] [Result: undefined]
    Extracted [Key: 2] [Result: undefined]
    Extracted [Key: 3] [Result: undefined]
    Extracted [Key: 4] [Result: undefined]
    Extracted [Key: 5] [Result: undefined]

Ouch, back to square one! And it's for the same reason -- the
value of `i` is bound to the outer function, so we're still just
referencing that same value after the loop is finished. Let's
rewrite it to use an assigment (like our second attempt, above)
but __inside__ our IIFE instead of __outside__:

    function createMapped_5( items ) {
        var mapped = {};
        for ( var i = 1; i <= items.length; i++ ) {
            (function() {
                var value = items[i-1];
                mapped[i] = (function() { return function() { return value } })();
                print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
            })();
        }
        print( "Last index is: " + i );
        return mapped;
    }

The output:

    Mapped    [Key: 1] [Result: owl]
    Mapped    [Key: 2] [Result: robin]
    Mapped    [Key: 3] [Result: eagle]
    Mapped    [Key: 4] [Result: sparrow]
    Mapped    [Key: 5] [Result: falcon]
    Last index is: 6
    Extracted [Key: 1] [Result: owl]
    Extracted [Key: 2] [Result: robin]
    Extracted [Key: 3] [Result: eagle]
    Extracted [Key: 4] [Result: sparrow]
    Extracted [Key: 5] [Result: falcon]

Excellent! Our returned closure no longer references a variable
that's defined outside the loop, so it resolves properly. 

You may see a variant of this mechanism that passes in the
variables for the closure to reference, like:

    function createMapped_6( items ) {
        var mapped = {};
        for ( var i = 1; i <= items.length; i++ ) {
            (function( map, key, value ) {
                map[key] = (function() { return function() { return value; }; })();
                print( "Mapped    [Key: " + key + "] [Result: " + map[key]() + "]" );
            })( mapped, i, items[i-1] );
        }
        print( "Last index is: " + i );
        return mapped;
    }

This may feel cleaner because you're explicitly localizing the
variables used by the closure. But you are introducing multiple
names for the same values, which can be a problem for
comprehension. And if your closure references many variables it
can get unwieldly, though that may point out the need for other
work to do -- refactoring by consolidating multiple parameters
into an object, or breaking the closure into multiple functions,
or something else.

## Additional reading:

* [Code for this post](https://github.com/cwinters/summa_blog/tree/master/201204-javascript_scoping_gotcha)
* [Explaining JavaScript Scope And Closures](http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/)
* [Immediately-Invoked Function Expression (IIFE)](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)
* [Gotcha gotcha](http://calculist.blogspot.com/2005/12/gotcha-gotcha.html)
  

----------------------------------------

## Extra stuff

Ruby's complaint is slightly different. With:

    (0..4).each{ |i| puts "In loop: #{i}" }
    puts "Out of loop: #{i}"

we get:

    $ ruby outside_block.rb 
    In loop: 0
    In loop: 1
    In loop: 2
    In loop: 3
    In loop: 4
    outside_block.rb:2:in `<main>': undefined local variable or method `i' for main:Object (NameError)


