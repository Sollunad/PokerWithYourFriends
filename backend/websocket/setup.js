const io = require('socket.io');
const socketioJwt = require("socketio-jwt");
const jwks = require("jwks-rsa");
const messageHandler = require('./messageHandler');

exports.start = start;

function start(server) {
    const ioServer = io(server, {
        cors: {
            origin: 'http://localhost:8080',
            credentials: true,
        },
    });

    ioServer.use(socketioJwt.authorize({
        secret: jwks.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 5,
            jwksUri: "https://pwyf.eu.auth0.com/.well-known/jwks.json",
        }),
        auth_header_required: true,
        handshake: true,
    }));

    ioServer.on('connection', (socket) => {
        console.log('connected!');
        socket.on('message', async (message) => {
            const game_code = socket.handshake.headers.game_code;
            const user_id = socket.decoded_token.sub;
            await messageHandler.handle(message, game_code, user_id);
        });
    });
}