'use strict';

const Discord = require("discord.js");

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
    currentChannel.send('Try typing \'help\' for a list of commands!');
}

/**
 * Sends MessageHandler case options to channel.
 * @function displayHelpOptions
 * @private
 */
function displayHelpOptions() {
    currentChannel.send('It looks like you need reminded of all that I can do ~~ ^_^');
    currentChannel.send('To gather players for a game at the game table, type \'setup\'.');
    currentChannel.send('To list the current players at the game table, type \'table\'.');
}

/**
 * Iterates through playerMap and sends a message in channel regarding player name and seat position at table.
 * @function listPlayersAtTable
 * @private
 */
function listPlayersAtTable() {
    currentChannel.send('Let\'s see who\'s at the table!');
    if(playerMap && Array.from(playerMap.entries()).length) {
        playerMap.forEach((value) => {
            currentChannel.send(`Seat ${value.seat + 1}: ${value.name}`);
        });
    } else {
        currentChannel.send('I\'m here all by myself... >_<');
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

    currentChannel.send('Seats are available at the game table! Type \'join\' to claim your seat! Only 4 spots are available!');

    let seatCounter = 0;
    let collectorOptions = {
        time: 10000
    };
    let collectorFilter = msg => msg.content.toLowerCase() === 'join';
    let playerCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

    playerCollector.on('collect', m => {
        if(!playerMap.get(m.author.id) && seatCounter < 4) {
            m.reply('welcome to the table!');
            playerMap.set(m.author.id, {name: m.author.username, seat: seatCounter});
            seatCounter++;
        }
    });

    playerCollector.on('end', () => {
        currentChannel.send('Seats are now reserved!');
        listPlayersAtTable();
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
            case 'setup':
                collectPlayers();
                break;
            case 'table':
                listPlayersAtTable();
                break;
            case 'help':
                displayHelpOptions();
                break;
            default:
                defaultMessage(msg);
                break;
        }
    }
}

module.exports = {
    SetupChatBot: SetupChatBot,
    MessageHandler: MessageHandler
};