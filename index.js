const blackjackManager = require('./src/blackjackManager.js');

var discordPlayerData = [
    {
        id: '1',
        name: 'Alex',
        balance: '100'
    },
    {
        id: '2',
        name: 'Sid',
        balance: '100'
    },
    {
        id: '3',
        name: 'Myles',
        balance: '100'
    },
    {
        id: '4',
        name: 'Peter',
        balance: '100'
    }
];

discordPlayerData.push({
    id: 'BOT',
    name: 'Dealer'
});

var players = blackjackManager.RegisterPlayers(discordPlayerData);
blackjackManager.NewGame(players);
var maxPlayerHandValue = 0;

players.forEach(player => {
    if(player.id !== 'BOT') {
        if(player.handValue > maxPlayerHandValue) {
            maxPlayerHandValue = player.handValue;
        }
        console.log('Player: ' + player.name);
        console.log(player.hand);
        console.log(player.handValue);
    }
});

var bot = players[players.length - 1];
console.log('Dealer');
console.log(bot.hand[1]);

while(bot.handValue < maxPlayerHandValue && bot.handValue < 17) {
    blackjackManager.Hit(bot);
    console.log(bot.hand);
}