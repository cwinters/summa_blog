var serverUrl  = null;  // empty means ALL
var port       = 8080;
var fayePort   = port + 1;

var BASE       = 'web'; // determine dynamically...
var DIR_REGEXP = new RegExp( '/$' );
var INDEX      = 'index.html';
var NOT_FOUND  = { 'Content-Type' : 'text/plain' };

var faye       = require( 'faye' );
var fs         = require( 'fs' );
var http       = require( 'http' );
var util       = require( 'util' );

function generateNotFound( res, message ) {
    res.writeHead( 404, NOT_FOUND );
    res.end( message );
}

var Dispatcher = function( regexp, type, header ) {
    this.regexp = regexp;
    this.type   = type;
    this.header = header || {};
};

Dispatcher.prototype.execute = function( req, res ) {
    var resolvedUrl = DIR_REGEXP.test( req.url ) ? req.url + INDEX : req.url;
    var urlMatches = this.regexp.test( resolvedUrl );
    if ( ! urlMatches ) return urlMatches;

    var fullPath = BASE + resolvedUrl;
    util.debug( "   => " + fullPath );
    if ( fs.existsSync( fullPath ) ) {
        if ( this.type === 'string' ) {
            res.writeHead( 200, this.header );
	        res.end( fs.readFileSync( fullPath, 'utf8' ) );
        }
        else if ( this.type === 'binary' ) {
            res.writeHead( 200, this.header );
            res.end( fs.readFileSync( fullPath ), 'binary' );
        }
        else {
            generateNotFound( res, 'No such type: ' + this.type );
        }
    }
    else {
        util.debug( "   *** NOT FOUND" );
        res.writeHead( 404 );
    }
    return true;
};

var dispatchers = [
    new Dispatcher( new RegExp( '\.json$' ),      'string', { 'Content-Type': 'application/json' } ),
    new Dispatcher( new RegExp( '\.js$' ),        'string', { 'Content-Type': 'text/javascript' } ),
    new Dispatcher( new RegExp( '\.css$' ),       'string', { 'Content-Type': 'text/css' } ),
    new Dispatcher( new RegExp( '\.html$'),       'string', { 'Content-Type': 'text/html' } ),
    new Dispatcher( new RegExp( '\.txt$' ),       'string', { 'Content-Type': 'text/plain' } ),
    new Dispatcher( new RegExp( '\.(text|md)$' ), 'string', { 'Content-Type': 'text/markdown' } ),
    new Dispatcher( new RegExp( '\.png$' ),       'binary', { 'Content-Type': 'image/png' } ),
    new Dispatcher( new RegExp( '\.gif$' ),       'binary', { 'Content-Type': 'image/gif' } ),
    new Dispatcher( new RegExp( '\.jpe?g$' ),     'binary', { 'Content-Type': 'image/jpeg' } ),
    new Dispatcher( new RegExp( '\.ico$' ),       'binary', { 'Content-Type': 'image/x-icon' } )
];

var httpServer = http.createServer( function ( req, res ) {
    util.debug( "REQUEST: " + req.url );
    var handled = false;
    for ( var i = 0; i < dispatchers.length; i++ ) {
        var dispatcher = dispatchers[i];
        handled = dispatcher.execute( req, res );
        util.debug( "   " + dispatcher.regexp.toString() + " => " + handled );
        if ( handled ) break;
    }
    if ( ! handled ) {
        generateNotFound( res, "No dispatcher matched" );
    }
});

httpServer.listen( port, serverUrl );

var displayHost = serverUrl || 'localhost';
console.log( 'Server running at http://' + displayHost + ':' + port + ' => BRING IT!' );


var fayeServer = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });

fayeServer.bind( 'handshake', function( clientId ) {
    util.debug( "FAYE: new client connected..... " + clientId );
});

fayeServer.bind( 'subscribe', function( clientId, topic ) {
    util.debug( "FAYE: client subscribed.... " + clientId + " @ " + topic );
});

fayeServer.bind( 'unsubscribe', function( clientId, topic ) {
    util.debug( "FAYE: client unsubscribed...... " + clientId + " @ " + topic );
});

fayeServer.bind( 'publish', function( clientId, topic, message ) {
    util.debug( "FAYE: message published........ " + clientId + " @ " + topic + " => " + JSON.stringify( message ) );
});

fayeServer.listen( fayePort, serverUrl );
console.log( 'Faye running at http://' + displayHost + ':' + fayePort + ' => BRING IT ASYNC!' );



