const io = require('socket.io');
const socketioJwt = require("socketio-jwt");
const jwks = require("jwks-rsa");
const messageHandler = require('./messageHandler');
const { getGame } = require("../services/games/controller");
const { getTable } = require("../services/tables/controller");
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
        clients.push({socket, game_code, user_id});
        await broadcastGameState(game_code);

        socket.on('message', async (message) => {
            await messageHandler.handle(message, game_code, user_id);
            await broadcastGameState(game_code);
        });

        socket.on('disconnect', async () => {
            clients = clients.filter(c => c.socket.id !== socket.id);
            await broadcastGameState(game_code);
        })
    });
}

async function broadcastGameState(game_code) {
    const clientsForGame = clients.filter(c => c.game_code === game_code);
    const beGame = await getGame(game_code);
    if (!beGame) return;
    const table = getTable(game_code);

    clientsForGame.forEach((client) => {
        const user_id = client.user_id;
        const socket = client.socket;
        const feGameState = getFEGameState(beGame, table, user_id, clientsForGame);
        socket.send({game: feGameState});
    });
}