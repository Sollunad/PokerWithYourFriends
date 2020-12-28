const io = require('socket.io');
const socketioJwt = require("socketio-jwt");
const jwks = require("jwks-rsa");
const messageHandler = require('./messageHandler');
const uuid = require('uuid');
const { getGame } = require("../services/games/controller");
const { getFEGameState } = require("../services/games/feGameStateMapper");


exports.start = start;

let clients = [];

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

    ioServer.on('connection', async (socket) => {
        const game_code = socket.handshake.headers.game_code;
        const user_id = socket.decoded_token.sub;
        const id = uuid.v4();
        clients.push({socket, game_code, user_id, id});
        await broadcastGameState(game_code);

        socket.on('message', async (message) => {
            await messageHandler.handle(message, game_code, user_id);
            await broadcastGameState(game_code);
        });
    });
}

async function broadcastGameState(game_code) {
    const clientsForGame = clients.filter(c => c.game_code === game_code);
    // TODO
    const table = undefined;
    const beGame = await getGame(game_code);

    clientsForGame.forEach((client) => {
        const user_id = client.user_id;
        const socket = client.socket;
        const feGameState = getFEGameState(beGame, table, user_id);
        socket.send({game: feGameState});
    });
}