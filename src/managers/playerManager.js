'use strict';

/**
 * Updates map with blackjack values foreach player.
 * @function createPlayer
 * @param {map of player data} player
 * @private
 */
function createBlackjackPlayer(playerMap) {
    for(let i = 0; i < Array.from(playerMap.entries()).length; i++) {
        let originalPlayerValues = playerMap.get(i);
        playerMap.set(i, {
            id: originalPlayerValues.id,
            name: originalPlayerValues.name,
            balance: 100,
            hand: [],
            handValue: 0,
            bust: false,
            currentWager: 0,
            skipRound: false
        });
    }
}

/**
 * Updates player balance based on result value.
 * @param {Map object of player data} playerMap 
 * @param {Key of player in map} playerKey 
 * @param {String indicating action to take on player balance data} gameResult
 */
function RewardPlayer(playerMap, playerKey, gameResult) {
    let player = playerMap.get(playerKey);
    if(gameResult === 'draw') {
        player.balance += player.currentWager;
    } else if(gameResult === 'win') {
        player.balance += 2 * player.currentWager;
    }
}

/**
 * Resets player bet data within player map.
 * @function ResetPlayerBetValues
 * @param {Map object of player data} playerMap 
 * @public
 */
function ResetPlayerBetValues(playerMap) {
    for(let i = 1; i < Array.from(playerMap.entries()).length; i++) {
        let currentPlayer = playerMap.get(i);
        currentPlayer.skipRound = true;
        currentPlayer.currentWager = 0;
        playerMap.set(i, currentPlayer);
    }
}

/**
 * Determines key of player map entry from identifier of player.
 * @function DeterminePlayerMapKey
 * @param {Map object of player data} playerMap 
 * @param {identifier for player in map entries} playerId 
 * @public
 */
function DeterminePlayerMapKey(playerMap, playerId) {
    let playerMapKey;
    for (let [key, value] of playerMap.entries()) {
        if (value.id === playerId) {
            playerMapKey = key;
            break;
        }
    }
    return playerMapKey;
}

/**
 * Updates player map balance and current wager value based on passed wager.
 * @function HandlePlayerBet
 * @param {Map object of player data} playerMap 
 * @param {key of player in playerMap} playerKey 
 * @param {numeric value of player wager} playerWager 
 * @public
 */
function HandlePlayerBet(playerMap, playerKey, playerWager) {
    let result = false;
    if(playerKey && !isNaN(playerWager)) {
        let player = playerMap.get(playerKey);
        if(player.balance >= playerWager) {
            player.balance -= playerWager;
            player.currentWager = playerWager;
            player.skipRound = false;
            playerMap.set(playerKey, player);
            result = true;
        }
    }
    return result;
}

/**
 * Creates an array of player objects from provided number of desired players.
 * @function RegisterPlayers
 * @param {map of initial player data} initialPlayersData
 * @param {string of game to register player objects for} game
 * @public
 */
function RegisterPlayers(initialPlayersData, game) {
    switch(game){
        case 'blackjack':
            createBlackjackPlayer(initialPlayersData);
            break;
        default:
            console.error('Game value not provided, unable to register players...');
            break;
    }
}

module.exports = {
    RegisterPlayers: RegisterPlayers,
    HandlePlayerBet: HandlePlayerBet,
    DeterminePlayerMapKey: DeterminePlayerMapKey,
    ResetPlayerBetValues: ResetPlayerBetValues,
    RewardPlayer: RewardPlayer
};