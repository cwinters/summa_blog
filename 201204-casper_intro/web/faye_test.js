$(document).ready( function() {
  window.fayeClient = new Faye.Client( 'http://localhost:8081/faye' );
  var topic = '/messages';

  window.fayeClient.subscribe( topic, function( message ) {
    alert( 'Got: ' + message.text );
  });
  console.log( "OK: subscribed to " + topic );

  $( '#button_send' ).click( function( uiEvent ) {
      uiEvent.preventDefault();

      var message = $( '#message' ).val();
      if ( message ) {
          window.fayeClient.publish( topic, { text: message });
          console.log( "OK: published message to " + topic );
      }

      // add notification here...
  });

});
