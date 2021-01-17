require('dotenv').config();

const Discord = require('discord.js');
const ChatBot = require('./src/chatBot.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    ChatBot.SetupChatBot(client, process.env);
});

client.on('message', ChatBot.MessageHandler);

client.login(process.env.DISCORD_TOKEN);