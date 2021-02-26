'use strict';

const PlayerManager = require('./managers/playerManager.js');
const BlackjackChatter = require('./gameChatters/blackjackGameChatter');

let Discord, currentChannel, botId, playerMap;

/**
 * Sends message to table indicating no players are at table.
 * @function displayNoTableMembersMessage
 * @private
 */
function displayNoTableMembersMessage() {
    currentChannel.send('There\'s nobody at the table... trying typing \'-setup\' first, desu! ~~');
}

/**
 * Sends MessageHandler case options to channel.
 * @function displayHelpOptions
 * @private
 */
function displayHelpOptions() {
    currentChannel.send('It looks like you need reminded of all that I can do ~~ ^_^\nTo gather players for a game at the game table, type \'-setup\'.\nTo list the current players at the game table, type \'-table\'.\nTo play a round of blackjack,  type \'-play\'.\nTo see your current balance, type \'-balance\'.');
}

/**
 * Iterates through playerMap and sends a message in channel regarding player name and seat position at table.
 * @function listPlayersAtTable
 * @private
 */
function listPlayersAtTable() {
    currentChannel.send('Let\'s see who\'s at the table!');
    if(playerMap && Array.from(playerMap.entries()).length) {
        let playerListString = '';
        playerMap.forEach((value, key) => {
            playerListString += `Seat ${key + 1}: ${value.name}\n`;
        });
        currentChannel.send(playerListString);
    } else {
        currentChannel.send('I\'m here all by myself... >_<');
    }
}

/**
 * Collects unique players from chat who requested to join via Discord.MessageCollector.
 * @function collectPlayers
 * @private
 */
function collectPlayers(game) {
    playerMap = undefined;
    let tempPlayerMap = new Map();

    let playerIds = [];
    tempPlayerMap.set(playerIds.length, { id: botId, name: 'Dealer' });
    playerIds.push(botId);

    currentChannel.send('Seats are available at the game table! Type \'-join\' to claim your seat! Only 4 spots are available!');

    let collectorOptions = {
        time: 10000
    };
    let collectorFilter = msg => msg.content.toLowerCase() === '-join';
    let playerCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

    playerCollector.on('collect', m => {
        if(!playerIds.includes(m.author.id) && playerIds.length < 5) {
            m.reply('welcome to the table!');
            tempPlayerMap.set(playerIds.length, { id: m.author.id, name: m.author.username });
            playerIds.push(m.author.id);
        }
    });

    playerCollector.on('end', () => {
        currentChannel.send('Seats are now reserved!');
        playerMap = tempPlayerMap;
        listPlayersAtTable();
        PlayerManager.RegisterPlayers(playerMap, game);
    });
}

/**
 * Displays a given player's balance who is at the table.
 * @function displayPlayerBalance
 * @private 
 */
function displayPlayerBalance(msg) {
    let playerKey = PlayerManager.DeterminePlayerMapKey(playerMap, msg.author.id);
    let player = playerMap.get(playerKey);
    if(player) {
        msg.reply(`your balance is $${player.balance}`);
    } else {
        msg.reply('Uwaaaaa... you\'re not at the table D:');
    }
}

/**
 * Performs initial configurations for chat bot.
 * @function SetupChatBot
 * @public
 */
function SetupChatBot(client, envProps, discord) {
    Discord = discord;
    botId = envProps.BOT_ID;
    currentChannel = client.channels.cache.get(envProps.CHANNEL_ID);
    currentChannel.send('Kakegurui-chan is now online!');
}

/**
 * Callback function to handle Discord messages from users.
 * @function MessageHandler
 * @public
 */
function MessageHandler(msg) {
    if(msg.author.id !== botId) {
        switch(msg.content.toLowerCase()){
            case '-setup':
                collectPlayers('blackjack');
                break;
            case '-table':
                playerMap ? listPlayersAtTable() : displayNoTableMembersMessage();
                break;
            case '-help':
                displayHelpOptions();
                break;
            case '-play':
                // TODO: Player can invoke '-play' multiple times... we must prevent this action.
                playerMap ? BlackjackChatter.PlayRoundOfBlackjack(Discord, PlayerManager, currentChannel, playerMap) : displayNoTableMembersMessage();
                break;
            case '-balance':
                playerMap ? displayPlayerBalance(msg) : displayNoTableMembersMessage();
                break;
            default:
                break;
        }
    }
}

module.exports = {
    SetupChatBot: SetupChatBot,
    MessageHandler: MessageHandler
};