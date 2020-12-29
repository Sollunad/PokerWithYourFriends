var poker = require('./lib/node-poker');

var table = new poker.Table('ABCD', 50, 100, 0);

table.AddPlayer('A',2000);
table.AddPlayer('B',1507);
table.AddPlayer('C',1003);
table.AddPlayer('D',1000);
table.StartGame();

table.players[0].Bet(2000);
table.players[1].Call();
table.players[2].Call();
table.players[3].Call();

console.log(table.game.board);
console.log(table.players[0].cards);
console.log(table.players[1].cards);
console.log(table.players[2].cards);
console.log(table.players[3].cards);
console.log(table.gameWinners);
