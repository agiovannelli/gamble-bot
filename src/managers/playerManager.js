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
            bust: false
        });
    }
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
    RegisterPlayers: RegisterPlayers
};