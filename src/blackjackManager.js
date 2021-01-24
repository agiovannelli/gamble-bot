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
 * @param {map of player objects} players 
 * @private
 */
function resetPlayerValues(players) {
    players.forEach((player, key) => {
        player.hand = [];
        player.bust = false;
        players.set(key, player);
    });
}

/**
 * Determines player with highest hand value.
 * @function determinePlayerMaxHandValue
 * @param {Map of players at blackjack table} players 
 * @param {Dealer object containing hand and hand value info} dealer 
 * @private
 */
function determinePlayerMaxHandValue(players, dealer) {
    let maxHandValue = 0;
    players.forEach(player => {
        if(player.id !== dealer.id && !player.bust && player.handValue > maxHandValue) {
            maxHandValue = player.handValue;
        }
    });
    return maxHandValue;
}

/**
 * Creates new deck and shuffles, deals cards to players at table.
 * @function NewGame
 * @param {map of players to initial deal hands} players 
 * @public
 */
function NewGame(players) {
    deck = deckManager.CreateDeck();
    deck = deckManager.ShuffleDeck(deck);

    resetPlayerValues(players);

    for(let i = 0; i < 2; i++) {
        players.forEach((player, key) => {
            Hit(player);
            players.set(key, player);
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

/**
 * Performs a dealers turn based on player's hands at table.
 * @function DealerTurn
 * @param {Map of players at blackjack table} players 
 * @param {Seat of dealer at blackjack table} dealerSeat 
 * @public
 */
function DealerTurn(players, dealerSeat) {
    let dealer = players.get(dealerSeat);
    let maxPlayerHandValue = determinePlayerMaxHandValue(players, dealer);

    while(dealer.handValue < maxPlayerHandValue && dealer.handValue < 17) {
        Hit(dealer);
    }

    players.set(dealerSeat, dealer);
}

module.exports = {
    NewGame: NewGame,
    Hit: Hit,
    DealerTurn: DealerTurn
};