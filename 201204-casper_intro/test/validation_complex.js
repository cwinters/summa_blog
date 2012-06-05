var casper = require( 'casper' ).create();

//casper.options.logLevel = "debug";
//casper.options.verbose = true;

casper.start( 'web/complex_form.html', function() {
    this.capture( '1_initial_form.png' );
    this.click( '#complex_form_submit' );
    this.capture( '2_click_blank.png' );
    assertValidationMessages.call( this, { 'in' : [ 'name', 'age', 'doctor' ], 
                                           'suffix' : '1: empty' });

    // enter a person, then retry:
    
    this.fill( 'form#complex_form', { person_name : 'Esmerelda Villalobos' }, false );
    this.click( '#complex_form_submit' );
    this.capture( '3_click_with_person.png' );
    assertValidationMessages.call( this, { 'in' : [ 'age', 'doctor' ], 'out' : [ 'name' ], 
                                           'suffix' : '2: +person' } );

    this.fill( 'form#complex_form', { person_age : '2' }, false );
    this.click( '#complex_form_submit' );
    this.capture( '4_click_with_age.png' );
    assertValidationMessages.call( this, { 'in' : [ 'doctor' ], 'out' : [ 'name', 'age' ],
                                           'suffix' : '3: +age' } );

    this.fill( 'form#complex_form', { physician : '783' }, false );
    this.click( '#complex_form_submit' );
    this.capture( '5_click_with_doc.png' );
    assertValidationMessages.call( this, { 'out' : [ 'name', 'age', 'doctor' ],
                                           'suffix' : '4: +doc' } );
    this.test.assertEvalEquals( function() { return $( '#errors' ).html() }, '', 
                                'No validation error messages' );
});

casper.run( function() {
    this.test.renderResults( true );
});

var assertMismatch = function( subject, pattern, message ) {
    return this.test.assert( ! pattern.test( subject ), message, {
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

var forEach = function( array, fn, context ) {
    for ( var i = 0; i < array.length; i++ ) {
        var item = array[i];
        if ( context ) { 
            fn.call( context, item );
        }
        else {
            fn( item );
        }
    }
};

var assertValidationMessages = function( params ) {
    var should    = params['in']  || [];
    var shouldnt  = params['out'] || [];
    var errorText = this.fetchText( '#errors' );
    var suffix    = params['suffix'] ? ' [' + params['suffix'] + ']' : '';
    forEach( should, function( type ) {
        var info   = validations[ type ];
        var prefix = 'Validation message exists for ';
        return this.test.assertMatch( errorText, info.pattern,
                                      prefix + info.description + suffix );
    }, this );
    forEach( shouldnt, function( type ) {
        var info   = validations[ type ];
        var prefix = 'Validation message should not exist for ';
        return assertMismatch.call( this, errorText, info.pattern,
                                    prefix + info.description + suffix );
    }, this );
};
