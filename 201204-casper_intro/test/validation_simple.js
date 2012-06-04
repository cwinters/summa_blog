var casper = require( 'casper' ).create();

casper.start( 'web/simple_form.html', function() {
    this.click( '#simple_form_submit' );
    var errorText = this.fetchText( '#errors' );
    this.capture( 'simple_1_with_error.png' );
    this.test.assertMatch( errorText,  /Person name is required/, 
                           'Expected validation message for person name' );
});

casper.run( function() {
    this.test.renderResults( true );
});