'use strict';

const { Message } = require("discord.js");

let currentChannel;
let botId;

function SetupChatBot(client, envProps) {
    botId = envProps.BOT_ID;
    currentChannel = client.channels.cache.get(envProps.CHANNEL_ID);
    currentChannel.send('Blackjack-chan is now online!');
}

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