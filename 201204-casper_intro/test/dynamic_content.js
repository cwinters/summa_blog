var casper = require( 'casper' ).create();

//casper.options.logLevel = "debug";
//casper.options.verbose  = true;

casper.start( 'web/complex_form.html', function() {
    this.capture( 'complex_1_before_fill.png' );
    this.fill( 'form#complex_form', { 
        person_name : 'Marcellus Wallace',
        physician   : '783',
        gender      : 'male'
    }, false );

    // the 'trigger' is necessary because 'change' jQuery event is only fired 
    // when the user actually clicks on and choses an option
    this.evaluate( function() { 
        $( '#person_age' ).val( '3' ).trigger( 'change' ); 
    });

    // do the same with the age, except this is content fetched via JSON
    // first, wait until our memories are visible...
    this.waitForSelector( '#person_age_memories',  function() {
        this.capture( 'complex_2_after_first_age.png' );
        assertMemories.call( this, 2 );

        // now switch the age and verify that the options change
        this.evaluate( function() { 
            $( '#person_age' ).val( '2' ).trigger( 'change' ); 
        });
        this.waitForSelector( '#person_age_memories',  function() {
            this.capture( 'complex_3_after_second_age.png' );
            assertMemories.call( this, 3 );
        });
    });

});

casper.run( function() {
    this.test.renderResults( true );
});

function assertMemories( expectedCount ) {
    // grab the simple JavaScript objects from the browser
    // for comparison -- we know there are two, so verify
    var memories = this.evaluate( function() { return Page.memories } );
    this.test.assertEquals( memories.length, expectedCount, 
                            "Expected " + expectedCount + " memories" );
    var checkboxCount = this.evaluate( function() { 
        return $( '#person_age_memories input' ).length;
    });
    this.test.assert( memories.length == checkboxCount, 
                      "Expected same number of checkboxes as JS objects (" + checkboxCount + ")" );
        
    // now ensure the content for each is present
    var memoryText = this.fetchText( '#person_age_memories' );
    for ( var i = 0; i < memories.length; i++ ) {
        this.test.assertMatch( memoryText, new RegExp( memories[i].name ), 
                               "Memory " + (i+1) + " present (" + memories[i].name + ")" );
    }
}