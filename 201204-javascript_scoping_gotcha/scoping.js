function createMapped_1( items ) {
    var mapped = {};
    for ( var i = 1; i <= items.length; i++ ) {
        mapped[i] = function() { return items[i-1]; };
        print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
    }
    print( "Last index is: " + i );
    return mapped;
}

function createMapped_2( items ) {
    var mapped = {};
    for ( var i = 1; i <= items.length; i++ ) {
        var value = items[i-1];
        mapped[i] = function() { return value; };
        print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
    }
    print( "Last index is: " + i );
    return mapped;
}

function createMapped_3( items ) {
    var mapped = {};
    var i;
    var value;
    for ( i = 1; i <= items.length; i++ ) {
        value = items[i-1];
        mapped[i] = function() { return value; };
        print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
    }
    print( "Last index is: " + i );
    return mapped;
}

function createMapped_4( items ) {
    var mapped = {};
    for ( var i = 1; i <= items.length; i++ ) {
        (function() {
            mapped[i] = (function() { return function() { return items[i-1]; }; })();
            print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
        })();
    }
    print( "Last index is: " + i );
    return mapped;
}

function createMapped_5( items ) {
    var mapped = {};
    for ( var i = 1; i <= items.length; i++ ) {
        (function() {
            var value = items[i-1];
            mapped[i] = (function() { return function() { return value; }; })();
            print( "Mapped    [Key: " + i + "] [Result: " + mapped[i]() + "]" );
        })();
    }
    print( "Last index is: " + i );
    return mapped;
}

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

function showMapped( map ) {
    for ( var key in map ) {
        var fn = map[ key ];
        print( "Extracted [Key: " + key + "] [Result: " + fn() + "]" );
    }
}

function banner( head ) {
    print( "" );
    print( head );
    print( "========================================" );
}

var birds = [ 'owl', 'robin', 'eagle', 'sparrow', 'falcon' ];
banner( "One (initial naive)" );
showMapped( createMapped_1( birds ) );

banner( "Two (assign to variable)" );
showMapped( createMapped_2( birds ) );

banner( "Three (pull variable out of loop like JS)" );
showMapped( createMapped_3( birds ) );

banner( "Four (wrap loop body in closure with reference and execute)" );
showMapped( createMapped_4( birds ) );

banner( "Five (wrap loop body in closure with local variable and execute)" );
showMapped( createMapped_5( birds ) );

banner( "Six (wrap loop body in closure and execute with arguments)" );
showMapped( createMapped_6( birds ) );
