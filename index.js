const blackjackManager = require('./src/blackjackManager.js');

var players = blackjackManager.RegisterPlayers(3);

blackjackManager.NewGame(players);

players.forEach(player => {
    console.log('Player seat: ' + player.seat);
    console.log(player.hand);
});

console.log('Player hit!');
blackjackManager.Hit(players[0]);
console.log('Player seat: 0');
console.log(players[0].hand);

blackjackManager.DetermineHandValue(players[0]);
console.log(players[0].handValue);