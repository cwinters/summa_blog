var casper = require( 'casper' ).create();

casper.start( 'web/sample_form.html', function() {
    this.capture( 'initial_form.png' );
    this.click( '#sample_form_submit' );
    this.capture( 'after_fill.png' );
    this.test.assertMatch( this.fetchText( '#errors' ),
                           /Person name is required/, 'Valid error for missing person name' );
});

casper.run( function() {
    this.test.renderResults( true );
});