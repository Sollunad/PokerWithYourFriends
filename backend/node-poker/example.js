var poker = require('./lib/node-poker');

var table = new poker.Table('ABCD', 50, 100, 0);

table.AddPlayer('A',1500);
table.AddPlayer('B',1500);
table.AddPlayer('C',1500);
table.StartGame();


console.log(table.game);
console.log(table.getCurrentPlayer());
table.players[0].Call();
table.players[1].Call();
table.players[2].Check();

table.players[0].Check();
table.players[1].Check();
table.players[2].Check();

table.players[0].Check();
table.players[1].Check();
table.players[2].Check();

table.players[0].Check();
table.players[1].Check();
table.players[2].Check();


console.log(table.game);
console.log(table.getCurrentPlayer());
console.log(table.players[0]);
console.log(table.gameWinners);
