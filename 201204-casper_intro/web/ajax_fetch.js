$(document).ready( function() {
    // wire in the HTML button => long way
    var longHtml = function() {
        $.get( '/partial.html' )
            .success( function( content ) {
                $( '#target_html' ).empty().show().html( content );
            })
            .fail( function( error ) {
                alert( "Failed to load partial: " + error );
            });
    };

    // wire in the HTML button => short way
    var shortHtml = function() {
        $( '#target_html' ).empty().show().load( '/partial.html' );
    };

    $( '#button_fetch_html' ).click( shortHtml );

    var loadJson = function() {
        $.getJSON( 'longer.json' )
            .success( function( data ) {
                alert( "Got " + _.size( data.characters ) + " characters " );
                var pretty = JSON.stringify( data, null, '    ' );
                $( '#target_json' ).empty().show().html( pretty );
            })
            .fail( function( error ) {
                alert( "Failed to load JSON: " + error );
            });
    };
    $( '#button_fetch_json' ).click( loadJson );
});