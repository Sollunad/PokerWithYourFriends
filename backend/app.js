const {createNewGame, joinGame} = require("./services/games/controller");

const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const https = require('https');
const jwt = require('express-jwt');
const jwks = require('jwks-rsa');

serveHTTP();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    //credentials : true
};

const jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://pwyf.eu.auth0.com/.well-known/jwks.json'
    }),
    audience: 'PWFY Backend',
    issuer: 'https://pwyf.eu.auth0.com/',
    algorithms: ['RS256']
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    console.log(req.user.sub);
    res.send('Success!');
});

app.post('/games', async function (req, res) {
    const db_response = await createNewGame(req.user.sub);
    if (db_response.db_status === 'success') {
        res.status(200).send({game_code: db_response.game_code});
    } else {
        res.status(500).send({error: db_response.error});
    }
});

app.post('/games/join', async function (req, res) {
    const game_code = req.body.game_code;
    if (!game_code) {
        res.status(400).send({error: 'Game-Code fehlt'});
        return;
    }
    const db_response = await joinGame(req.user.sub, game_code);
    res.status(200).end();
});

function serveHTTP() {
    const server = http.createServer(app);
    server.listen(8081);
    //websocket.start(server);
}

function serveHTTPS(credentials) {
    const server = https.createServer(credentials, app);
    server.listen(8080);
    //websocket.start(server);
}