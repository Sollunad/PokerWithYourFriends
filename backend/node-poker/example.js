var poker = require('./lib/node-poker');

var table = new poker.Table('ABCD', 5, 10, 0);

table.AddPlayer('A',35);
table.AddPlayer('B',35);
table.AddPlayer('C',35);
table.AddPlayer('D',35);
table.AddPlayer('E',35);
table.AddPlayer('F',35);
table.AddPlayer('G',35);
table.StartGame();

table.players[0].Bet(35);
table.players[1].Call();
table.players[2].Call();
table.players[3].Call();
table.players[4].Call();
table.players[5].Call();
table.players[6].Call();

console.log(table.game.board);
console.log(table.players[0].cards);
console.log(table.players[1].cards);
console.log(table.players[2].cards);
console.log(table.players[3].cards);
console.log(table.players[4].cards);
console.log(table.players[5].cards);
console.log(table.players[6].cards);
console.log(table.gameWinners);
