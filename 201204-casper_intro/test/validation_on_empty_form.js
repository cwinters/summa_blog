var casper = require( 'casper' ).create();

//casper.options.logLevel = "debug";
//casper.options.verbose = true;

(function addCustomAssertions( base ) {
    var assertMismatch = function( subject, pattern, message ) {
        return this.assert( ! pattern.test( subject ), message, {
            type: "assertMismatch",
            details: "Subject unexpectedly matched the provided pattern",
            values:  {
                subject: subject,
                pattern: pattern
            }
        });        
    };
    var validations = {
        age    : { pattern : /Age is required/,         description : 'age' },
        doctor : { pattern : /Doctor is required/,      description : 'doctor' },
        name   : { pattern : /Person name is required/, description : 'person name' }
    };

    base.assertValidationMessage = function( type, presence ) {
        var info = validations[ type ];
        var assertion = presence ? this.test.assertMatch : assertMismatch;
        var prefix    = presence ? 'Validation message exists for ' : 'Validation message not present for ';
        return assertion.call( this.test, this.fetchText( '#errors' ), info.pattern,
                                          prefix + info.description );
    };
})( casper );

casper.start( 'web/sample_form.html', function() {
    this.capture( '1_initial_form.png' );
    this.click( '#sample_form_submit' );
    this.capture( '2_after_click_blank.png' );
    this.assertValidationMessage( 'name', true );
    this.assertValidationMessage( 'age', true );
    this.assertValidationMessage( 'doctor', true );

    // enter a person, then retry:
    
    this.fill( 'form#sample_form', { person_name : 'Esmerelda Villalobos' }, false );
    this.click( '#sample_form_submit' );
    this.capture( '3_after_click_person.png' );
    this.assertValidationMessage( 'name', false );
    this.assertValidationMessage( 'age', true );
    this.assertValidationMessage( 'doctor', true );

    this.fill( 'form#sample_form', { person_age : '2' }, false );
    this.click( '#sample_form_submit' );
    this.capture( '4_after_click_age.png' );
    this.assertValidationMessage( 'name', false );
    this.assertValidationMessage( 'age', false );
    this.assertValidationMessage( 'doctor', true );

    this.fill( 'form#sample_form', { physician : '783' }, false );
    this.click( '#sample_form_submit' );
    this.capture( '5_after_click_doc.png' );
    this.test.assertEvalEquals( function() { return $( '#errors' ).html() }, '', 
                                'No validation error messages' );

});

casper.run( function() {
    this.test.renderResults( true );
});