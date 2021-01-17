'use strict';

const { Message } = require("discord.js");

let currentChannel;
let botId;

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
    if(msg.author.id !== botId) {
        switch(msg.content.toLowerCase()){
            case 'test':
                msg.reply('echo two bravo');
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