var Faye   = require('faye'),
    server = new Faye.NodeAdapter({mount: '/'});

server.listen(8081);