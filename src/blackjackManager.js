'use strict';

const deckManager = require('./deckManager.js');
let deck;

/**
 * Determines whether to provide max or min ace value for player hand.
 * @function handleAcesInHand
 * @param {player object} player 
 * @param {array of aces} aces
 * @private 
 */
function handleAcesInHand(player, aces) {
    aces.forEach(() => {
        if(player.handValue + 11 > 21) {
            player.handValue += 1;
        } else {
            player.handValue += 11;
        }
    });
}

/**
 * Determines the player's numeric hand value from hand property.
 * @function determineHandValue
 * @param {player object} player 
 * @private
 */
function determineHandValue(player) {
    player.bust = false;
    player.handValue = 0;
    let aces = [];
    player.hand.forEach(card => {
        switch (card.value) {
            case 'Ace':
                aces.push(card);
                break;
            case 'King':
            case 'Queen':
            case 'Jack':
                player.handValue += 10;
                break;
            default:
                player.handValue += parseInt(card.value);
                break;
        }
    });
    if(aces.length) {
        handleAcesInHand(player, aces);
    }
    if(player.handValue > 21) {
        player.bust = true;
    }
}

/**
 * Resets hand and bust value for each player.
 * @function resetPlayerValues
 * @param {array of player objects} players 
 * @private
 */
function resetPlayerValues(players) {
    players.forEach(player => {
        player.hand = [];
        player.bust = false;
    });
}

/**
 * Creates new deck and shuffles, deals cards to players at table.
 * @function NewGame
 * @param {array of players to initial deal hands} players 
 * @public
 */
function NewGame(players) {
    deck = deckManager.createDeck();
    deck = deckManager.shuffleDeck(deck);

    resetPlayerValues(players);

    for(let i = 0; i < 2; i++) {
        players.forEach(player => {
            player.hand.push(deck.pop());
            determineHandValue(player);
        });
    }
}

/**
 * Deals a card to the player provided.
 * @function Hit
 * @param {player object} player 
 * @public
 */
function Hit(player) {
    if(deck.length) {
        player.hand.push(deck.pop());
        determineHandValue(player);
    }
}

module.exports = {
    NewGame: NewGame,
    Hit: Hit
};