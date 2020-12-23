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