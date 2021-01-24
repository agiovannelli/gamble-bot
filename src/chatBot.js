'use strict';

const Discord = require("discord.js");
const BlackjackManager = require('./blackjackManager.js');
const PlayerManager = require('./playerManager.js');

let currentChannel;
let messageHandlerLocked;
let botId;
let playerMap;

/**
 * Notifies channel when an input is entered in chat but not recognized.
 * @param {Message received in MessageHandler} msg 
 * @function defaultMessage
 * @private
 */
function defaultMessage(msg) {
    msg.reply('Oops! I didn\'t quite get that... Please be patient with me and try again ~~ UwU');
    currentChannel.send('Try typing \'-help\' for a list of commands!');
}

/**
 * Sends MessageHandler case options to channel.
 * @function displayHelpOptions
 * @private
 */
function displayHelpOptions() {
    currentChannel.send('It looks like you need reminded of all that I can do ~~ ^_^');
    currentChannel.send('To gather players for a game at the game table, type \'-setup\'.');
    currentChannel.send('To list the current players at the game table, type \'-table\'.');
    currentChannel.send('To play a round of blackjack,  type \'-play\'.');
}

/**
 * Iterates through playerMap and sends a message in channel regarding player name and seat position at table.
 * @function listPlayersAtTable
 * @private
 */
function listPlayersAtTable() {
    currentChannel.send('Let\'s see who\'s at the table!');
    if(playerMap && Array.from(playerMap.entries()).length) {
        playerMap.forEach((value, key) => {
            currentChannel.send(`Seat ${key + 1}: ${value.name}`);
        });
    } else {
        currentChannel.send('I\'m here all by myself... >_<');
    }
}

/**
 * Iterates player hand array and extracts display strings, concatenates into single display string.
 * @function createPlayerHandString
 * @param {Array of card objects for given player} playerHand 
 * @private
 */
function createPlayerHandString(playerHand) {
    let result = '';
    for(let i = 0; i < playerHand.length; i++) {
        result += playerHand[i].displayString;
        if(i+1 !== playerHand.length) {
            result += ', ';
        }
    }
    return result;
}

/**
 * Provides message detailing all table member's hands to channel.
 * @function displayPlayersHands
 * @private
 */
function displayPlayersHands() {
    currentChannel.send('Players cards: ');
    playerMap.forEach((player) => {
        let playerHandString = createPlayerHandString(player.hand);
        currentChannel.send(`${player.name}\'s hand: ${playerHandString}`);
    });
}

/**
 * Hosts messaging logic required to play a single round of blackjack with table members.
 * @function playRoundOfBlackjack
 * @private
 */
function playRoundOfBlackjack() {
    let totalPlayersAtTable = playerMap ? Array.from(playerMap.entries()).length : false;
    if(totalPlayersAtTable) {
        BlackjackManager.NewGame(playerMap);
        displayPlayersHands();
    } else {
        currentChannel.send('There\'s nobody at the table... trying typing \'-setup\' first, desu! ~~');
    }
}

/**
 * Collects unique players from chat who requested to join via Discord.MessageCollector.
 * @function collectPlayers
 * @private
 */
function collectPlayers() {
    messageHandlerLocked = true;
    playerMap = new Map();

    currentChannel.send('Seats are available at the game table! Type \'-join\' to claim your seat! Only 4 spots are available!');

    let playerIds = [];
    let collectorOptions = {
        time: 10000
    };
    let collectorFilter = msg => msg.content.toLowerCase() === '-join';
    let playerCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

    playerCollector.on('collect', m => {
        if(!playerIds.includes(m.author.id) && playerIds.length < 4) {
            m.reply('welcome to the table!');
            playerMap.set(playerIds.length, { id: m.author.id, name: m.author.username });
            playerIds.push(m.author.id);
        }
    });

    playerCollector.on('end', () => {
        currentChannel.send('Seats are now reserved!');
        listPlayersAtTable();
        PlayerManager.RegisterPlayers(playerMap, 'blackjack');
        messageHandlerLocked = false;
    });
}

/**
 * Performs initial configurations for chat bot.
 * @function SetupChatBot
 * @param {Discord API client object} client 
 * @param {dotenv API properties} envProps 
 * @public
 */
function SetupChatBot(client, envProps) {
    botId = envProps.BOT_ID;
    currentChannel = client.channels.cache.get(envProps.CHANNEL_ID);
    currentChannel.send('Blackjack-chan is now online!');
}

/**
 * Callback function to handle Discord messages from users.
 * @function MessageHandler
 * @param {Discord API message object} msg 
 * @public
 */
function MessageHandler(msg) {
    if(msg.author.id !== botId && !messageHandlerLocked) {
        switch(msg.content.toLowerCase()){
            case '-setup':
                collectPlayers();
                break;
            case '-table':
                listPlayersAtTable();
                break;
            case '-help':
                displayHelpOptions();
                break;
            case '-play':
                playRoundOfBlackjack();
                break;
            default:
                if(msg.content[0] === '-') {
                    defaultMessage(msg);
                }
                break;
        }
    }
}

module.exports = {
    SetupChatBot: SetupChatBot,
    MessageHandler: MessageHandler
};