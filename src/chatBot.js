'use strict';

const Discord = require("discord.js");
const BlackjackManager = require('./managers/blackjackManager.js');
const PlayerManager = require('./managers/playerManager.js');

let currentChannel;
let messageHandlerLocked;
let botId;
let playerMap;

/**
 * No operation function.
 * @function noop
 * @private
 */
function noop() {}

/**
 * Notifies channel when an input is entered in chat but not recognized.
 * @param {Message received in MessageHandler} msg 
 * @function defaultMessage
 * @private
 */
function defaultMessage(msg) {
    if(msg.content[0] === '-') {
        msg.reply('Oops! I didn\'t quite get that... Please be patient with me and try again ~~ UwU\nTry typing \'-help\' for a list of commands!');
    }
}

/**
 * Sends MessageHandler case options to channel.
 * @function displayHelpOptions
 * @private
 */
function displayHelpOptions() {
    currentChannel.send('It looks like you need reminded of all that I can do ~~ ^_^\nTo gather players for a game at the game table, type \'-setup\'.\nTo list the current players at the game table, type \'-table\'.\nTo play a round of blackjack,  type \'-play\'.');
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
    currentChannel.send('Player\'s hands: ');
    playerMap.forEach((player) => {
        if(!player.skipRound) {
            let playerHandString = createPlayerHandString(player.hand);
            currentChannel.send(`${player.name}\'s hand (${player.handValue}): ${playerHandString}`);
        }
    });
}

/**
 * Determines if player has busted or can ask for another card.
 * @function handlePlayerHitResult
 * @param {current player object} player 
 * @param {MessageCollector for player turn handling} turnCollector 
 * @param {seat value of current player} seatNum 
 * @private
 */
function handlePlayerHitResult(player, turnCollector, seatNum) {
    playerMap.set(seatNum, player);
    let playerHandString = createPlayerHandString(player.hand);
    currentChannel.send(`${player.name}\'s hand (${player.handValue}): ${playerHandString}`);

    if(player.bust) {
        currentChannel.send('Bust!');
        turnCollector.stop();
    } else {
        currentChannel.send(`${player.name}: \'-hit\' or \'-stand\'?`);
    }
}

/**
 * Displays who has won/tied/lost based on dealer hand value.
 * @function displayAndHandleRoundResult
 * @private
 */
function displayAndHandleRoundResult() {
    let dealer = playerMap.get(0);
    let resultString = '';
    currentChannel.send('Let\'s see the round results!');
    for(let i = 1; i < Array.from(playerMap.entries()).length; i++) {
        let currentPlayer = playerMap.get(i);
        if(currentPlayer && !currentPlayer.skipRound) {
            if((dealer.bust && !currentPlayer.bust) || (currentPlayer.handValue > dealer.handValue && !currentPlayer.bust && !dealer.bust)) {
                resultString += `${currentPlayer.name}: wins!\n`;
                PlayerManager.RewardPlayer(playerMap, i, 'win');
            } else if(currentPlayer.handValue === dealer.handValue && !currentPlayer.bust && !dealer.bust) {
                resultString += `${currentPlayer.name}: draw!\n`;
                PlayerManager.RewardPlayer(playerMap, i, 'draw');
            } else {
                resultString += `${currentPlayer.name}: loses!\n`;
            }
        }
    }
    resultString !== '' ? currentChannel.send(resultString) : noop();
}

/**
 * Creates MessageCollector unique to each player for their turn.
 * @function playerTurn
 * @param {Seat of current player whose turn it is} seatNum 
 * @param {Highest seat number prior to Dealer seat} maxSeatNum 
 * @private
 */
function playerTurn(seatNum, maxSeatNum) {   
    let currentPlayer = playerMap.get(seatNum);
    if(currentPlayer && currentPlayer.skipRound) {
        seatNum++;
        playerTurn(seatNum, maxSeatNum);
    } else if(currentPlayer && seatNum < maxSeatNum) {
        currentChannel.send(`${currentPlayer.name}: \'-hit\' or \'-stand\'?`);

        let collectorOptions = {
            time: 15000
        };
        let collectorFilter = msg => msg.content.toLowerCase() === '-hit' || msg.content.toLowerCase() === '-stand';
        let turnCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

        turnCollector.on('collect', m => {
            if(m.author.id === currentPlayer.id) {
                switch(m.content.toLowerCase()) {
                    case '-hit':
                        BlackjackManager.Hit(currentPlayer);
                        handlePlayerHitResult(currentPlayer, turnCollector, seatNum);
                        break;
                    case '-stand':
                        turnCollector.stop();
                        break;
                    default:
                        break;
                }
            }
        });

        turnCollector.on('end', () => {
            seatNum++;
            currentChannel.send(`${currentPlayer.name}\'s turn is over.`);
            playerTurn(seatNum, maxSeatNum);
        });
    } else {
        BlackjackManager.DealerTurn(playerMap, 0);
        displayPlayersHands();
        displayAndHandleRoundResult();
        messageHandlerLocked = false;
    }
}

/**
 * Collects players bets, then launches round of blackjack.
 * @function collectBetsAndPlay
 * @param {Integer of players at game table} totalPlayersAtTable
 * @private
 */
function collectBetsAndPlay(totalPlayersAtTable) {
    messageHandlerLocked = true;
    PlayerManager.ResetPlayerBetValues(playerMap);
    currentChannel.send('Place your bets for the upcoming round! Type \'-bet\' followed by the amount you wish to wager :3\nBy not providing a bet amount, you will be skipped.');
    let totalBets = 0;

    let collectorOptions = {
        time: 10000
    };
    let collectorFilter = msg => msg.content.toLowerCase().includes('-bet');
    let playerBetCollector = new Discord.MessageCollector(currentChannel, collectorFilter, collectorOptions);

    playerBetCollector.on('collect', m => {
        let playerKey = PlayerManager.DeterminePlayerMapKey(playerMap, m.author.id);
        if(playerKey && m.content.toLowerCase().includes('-bet')) {
            let delimitedBetString = m.content.split(' ');
            let isBetValid = PlayerManager.HandlePlayerBet(playerMap, playerKey, delimitedBetString[1]);
            if(isBetValid) {
                m.reply(`has bet $${delimitedBetString[1]}.`);
                totalBets++;
            } else {
                m.reply('your bet isn\'t valid... D:');
            }
        }
    });

    playerBetCollector.on('end', () => {
        currentChannel.send('Betting is closed!\nLet\'s play!');
        if(totalBets) {
            BlackjackManager.NewGame(playerMap);
            displayPlayersHands();
            playerTurn(1, totalPlayersAtTable);
        } else {
            currentChannel.send('No bets were made... I guess nobody can beat me, uwa ~~');
            messageHandlerLocked = false;
        }
    });
}

/**
 * Hosts messaging logic required to play a single round of blackjack with table members.
 * @function playRoundOfBlackjack
 * @private
 */
function playRoundOfBlackjack() {
    let totalPlayersAtTable = playerMap ? Array.from(playerMap.entries()).length : false;
    if(totalPlayersAtTable && totalPlayersAtTable > 1) {
        collectBetsAndPlay(totalPlayersAtTable);
    } else {
        currentChannel.send('There\'s nobody at the table... trying typing \'-setup\' first, desu! ~~');
    }
}

/**
 * Collects unique players from chat who requested to join via Discord.MessageCollector.
 * @function collectPlayers
 * @private
 */
function collectPlayers(game) {
    messageHandlerLocked = true;
    playerMap = new Map();

    let playerIds = [];
    playerMap.set(playerIds.length, { id: botId, name: 'Dealer' });
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
            playerMap.set(playerIds.length, { id: m.author.id, name: m.author.username });
            playerIds.push(m.author.id);
        }
    });

    playerCollector.on('end', () => {
        currentChannel.send('Seats are now reserved!');
        listPlayersAtTable();
        PlayerManager.RegisterPlayers(playerMap, game);
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
    currentChannel.send('Kakegurui-chan is now online!');
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
                collectPlayers('blackjack');
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
                defaultMessage(msg);
                break;
        }
    }
}

module.exports = {
    SetupChatBot: SetupChatBot,
    MessageHandler: MessageHandler
};