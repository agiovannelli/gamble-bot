'use strict';

const BlackjackManager = require('../managers/blackjackManager.js');

let Discord, PlayerManager;

/**
 * No operation function.
 * @function noop
 * @private
 */
function noop() {}

/**
 * Iterates player hand array and extracts display strings, concatenates into single display string.
 * @function createPlayerHandString
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
function displayPlayersHands(currentChannel, playerMap) {
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
 * @private
 */
function handlePlayerHitResult(currentChannel, playerMap, player, turnCollector, seatNum) {
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
function displayAndHandleRoundResult(currentChannel, playerMap) {
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
 * @private
 */
function playerTurn(currentChannel, playerMap, seatNum, maxSeatNum) {   
    let currentPlayer = playerMap.get(seatNum);
    if(currentPlayer && currentPlayer.skipRound) {
        seatNum++;
        playerTurn(currentChannel, playerMap, seatNum, maxSeatNum);
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
                        handlePlayerHitResult(currentChannel, playerMap, currentPlayer, turnCollector, seatNum);
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
            playerTurn(currentChannel, playerMap, seatNum, maxSeatNum);
        });
    } else {
        BlackjackManager.DealerTurn(playerMap, 0);
        displayPlayersHands(currentChannel, playerMap);
        displayAndHandleRoundResult(currentChannel, playerMap);
    }
}

/**
 * Collects players bets, then launches round of blackjack.
 * @function collectBetsAndPlay
 * @private
 */
function collectBetsAndPlay(currentChannel, playerMap, totalPlayersAtTable) {
    PlayerManager.ResetPlayerBetValues(playerMap);
    currentChannel.send('Place your bets for the upcoming round! Type \'-bet\' followed by the amount you wish to wager :3\nBy not providing a bet amount, you will be skipped.');
    let totalBets = 0;

    let collectorOptions = {
        time: 20000
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
            displayPlayersHands(currentChannel, playerMap);
            playerTurn(currentChannel, playerMap, 1, totalPlayersAtTable);
        } else {
            currentChannel.send('No bets were made... I guess nobody can beat me, uwa ~~');
        }
    });
}

/**
 * Hosts messaging logic required to play a single round of blackjack with table members.
 * @function PlayRoundOfBlackjack
 * @public
 */
function PlayRoundOfBlackjack(discord, playerManager, currentChannel, playerMap) {
    Discord = discord;
    PlayerManager = playerManager;
    let totalPlayersAtTable = playerMap ? Array.from(playerMap.entries()).length : false;
    if(totalPlayersAtTable && totalPlayersAtTable > 1) {
        collectBetsAndPlay(currentChannel, playerMap, totalPlayersAtTable);
    } else {
        currentChannel.send('There\'s nobody at the table... trying typing \'-setup\' first, desu! ~~');
    }
}

module.exports = {
    PlayRoundOfBlackjack: PlayRoundOfBlackjack
};