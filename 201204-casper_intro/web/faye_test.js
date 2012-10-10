var Page = {
    fayeUrl  : 'http://localhost:8081/faye',
    template : {},
    topic    : {
        activity : '/activity',
        message  : '/messages'
    }
};

$(document).ready( function() {
    _.each( [ 'tmpl_announce', 'tmpl_hear', 'tmpl_speak' ], function( templateId ) {
        var templateSource = $( '#' + templateId ).html();
        Page.template[ templateId ] = Handlebars.compile( templateSource );
        console.log( "OK: Compiled template [ID: " + templateId + "]" );
    });

    var conversation = new Conversation();

    $( '#button_identify' ).click( function( uiEvent ) {
        uiEvent.preventDefault();
        //var identification = $(this).siblings().filter( 'input' ).val();
        var identification = $(this).closest( 'input' );
        if ( conversation.start( identification ) ) {
            $( '#identify' ).hide();
            $( '#chat' ).show();
        }
        else {
            alert( "EXTERMINATE! ENTER YOUR NAME HU-MAN!" );
        }
    });

    $( '#button_leave' ).click( function( uiEvent ) {
        uiEvent.preventDefault();
        conversation.stop();
        $( '#chat' ).hide();
        $( '#identify' ).show();
    });

});


var Conversation = function() {
    this.originator    = null;
    this.subscriptions = [];

    this.start = function( originator ) {
        var self = this;
        if ( ! originator ) {
            console.log( "FAIL: No originator, cannot start chat." );
            return false;
        }
        self.originator = originator;
        console.log( "OK: Assigned originator: " + originator );

        self.fayeClient = new Faye.Client( Page.fayeUrl );
        console.log( "OK: Connected to Faye" );

        self.fayeClient.publish( Page.topic.activity, {
            participant : self.originator,
            action      : 'joined'
        });

        self.subscriptions.push( self.fayeClient.subscribe( Page.topic.message, function( message ) {
            var participant = message.participant;
            if ( participant != self.originator ) {
                self.hear( participant, message.text );
            }
        }) );
        self.subscriptions.push( self.fayeClient.subscribe( Page.topic.activity, function( message ) {
            var participant = message.participant;
            if ( participant != self.originator ) {
                self.announce( message );
            }
        }) );
        console.log( "OK: Subscribed to " + Page.topic.message + " and " + Page.topic.activity );

        $( '#button_send' ).click( function( uiEvent ) {
            uiEvent.preventDefault();
            var $message = $( '#message' );
            self.speak( $message.val() );
            $message.attr( 'value', '' ).focus();
        });
        console.log( "OK: Attached click handler for send" );

        return true;
    };

    this.stop = function() {
        var self = this;
        self.fayeClient.publish( Page.topic.activity, {
            participant : self.originator,
            action      : 'left'
        });
        _.each( self.subscriptions, function( sub ) { self.fayeClient.unsubscribe( sub ) });
        self.fayeClient = null;
        console.log( "OK: Unsubscribed from Faye" );

        $( '#button_send' ).off( 'click' );
        console.log( "OK: Detached click handler for send" );

        self.originator = null;
    };

    this.announce = function( context ) {
        context.joined = context.action == 'joined';
        render( 'tmpl_announce', context );
    };;

    this.hear = function( speaker, message ) {
        render( 'tmpl_hear', { message : message, speaker : speaker });
    };

    this.speak = function( message ) {
        if ( message ) {
            this.fayeClient.publish( Page.topic.message, {
                participant : this.originator,
                text        : message
            });
            console.log( "OK: published message [Topic: " + Page.topic.message + "] [Message: " + message + "]" );
            render( 'tmpl_speak', { message : message });
        }
        return this;
    };

    // using a 'var' here so the function isn't accessible to the
    // user of this object, only to the object itself
    var render = function( templateName, context  ) {
        var template = Page.template[ templateName ];
        var content = template( context );
        $( '#conversation' ).append( content );
        console.log( "OK: rendered template and appended [Template: " + templateName + "]" );
    };
};

