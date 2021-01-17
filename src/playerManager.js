'use strict';

/**
 * Creates a base player object.
 * @function createPlayer
 * @param {position value of player at table (left->right)} playerSeatNum
 * @param {initial player data} player
 * @private
 */
function createBlackjackPlayer(playerSeatNum, player) {
    return {
        id: player.id,
        name: player.name,
        balance: player.balance,
        seat: playerSeatNum,
        hand: [],
        handValue: 0,
        bust: false
    }
}

/**
 * Creates an array of player objects from provided number of desired players.
 * @function RegisterPlayers
 * @param {array of initial player data} initialPlayersData
 * @param {string of game to register player objects for} game
 * @public
 */
function RegisterPlayers(initialPlayersData, game) {
    var players = [];
    for(let i = 0; i < initialPlayersData.length; i++) {
        switch(game){
            case 'blackjack':
                players.push(createBlackjackPlayer(i, initialPlayersData[i]));
                break;
            default:
                console.error('Game value not provided, unable to register players...');
                break;
        }
    }

    return players;
}

module.exports = {
    RegisterPlayers: RegisterPlayers
};