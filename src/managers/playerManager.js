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
            balance: 0,
            hand: [],
            handValue: 0,
            bust: false,
            currentWager: 0
        });
    }
}

/**
 * Determines key of player map entry from identifier of player.
 * @function determinePlayerMapKey
 * @param {Map object of player data} playerMap 
 * @param {identifier for player in map entries} playerId 
 * @private
 */
function determinePlayerMapKey(playerMap, playerId) {
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
 * @param {identifier of player in map entries} playerId 
 * @param {numeric value of player wager} playerWager 
 * @public
 */
function HandlePlayerBet(playerMap, playerId, playerWager) {
    let playerMapKey = determinePlayerMapKey(playerMap, playerId);
    let result = false;
    if(playerMapKey && !isNaN(playerWager)) {
        let player = playerMap.get(playerMapKey);
        if(player.balance >= playerWager) {
            player.balance -= playerWager;
            player.currentWager = playerWager;
            playerMap.set(playerMapKey, player);
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
    HandlePlayerBet: HandlePlayerBet
};