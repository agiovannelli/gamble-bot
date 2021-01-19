'use strict';

const Discord = require("discord.js");

let currentChannel;
let messageHandlerLocked;
let botId;
let playerMap;

/**
 * Collects unique players from chat who requested to join via Discord.MessageCollector.
 * @function collectPlayers
 * @private
 */
function collectPlayers() {
    messageHandlerLocked = true;
    playerMap = new Map();

    currentChannel.send('Starting a game of blackjack! Type \'join\' to claim your seat at the table!')

    let collectorOptions = {
        time: 10000
    };
    let collectorFilter = msg => msg.content.toLowerCase() === 'join';
    let playerCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

    playerCollector.on('collect', m => {
        if(!playerMap.get(m.author.id)) {
            m.reply('Welcome to the table!');
            playerMap.set(m.author.id, {name: m.author.username});
        }
    });

    playerCollector.on('end', () => {
        playerMap.forEach((value, key) => {
            console.log('Player registered: ' + value.name)
        });
        currentChannel.send('Player collection complete!');
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
            case 'blackjack':
                collectPlayers();
                break;
            default:
                msg.reply('listening!');
                break;
        }
    }
}

module.exports = {
    SetupChatBot: SetupChatBot,
    MessageHandler: MessageHandler
};