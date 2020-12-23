var poker = require('./lib/node-poker');

var table = new poker.Table(50,100,2,10,100,1500);

table.AddPlayer('A',1500);
table.AddPlayer('B',1500);
table.AddPlayer('C',1500);
table.StartGame();


console.log(table.game);
console.log(table.getCurrentPlayer());
table.players[0].Bet(150);
table.players[1].Call();
table.players[2].Bet(100);
table.players[0].Call();
table.players[1].Call();

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
console.log(table.players[0].cards);
console.log(table.players[1].cards);
console.log(table.players[2].cards);
console.log(table.getWinners());
