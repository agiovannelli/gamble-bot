'use strict';

const deckManager = require('./deckManager.js');
let deck;

/**
 * Creates a base player object.
 * @function createPlayer
 * @param {position value of player at table (left->right)} playerSeatNum 
 * @private
 */
function createPlayer(playerSeatNum) {
    return {
        seat: playerSeatNum,
        hand: [],
        handValue: 0
    }
}

/**
 * Determines whether to provide max or min ace value for player hand.
 * @function handleAcesInHand
 * @param {player object} player 
 * @param {array of aces} aces
 * @private 
 */
function handleAcesInHand(player, aces) {
    aces.forEach(ace => {
        if(player.handValue + 11 > 21) {
            player.handValue += 1;
        } else {
            player.handValue += 11;
        }
    });
}

/**
 * Determines the player's numeric hand value from hand property.
 * @function DetermineHandValue
 * @param {player object} player 
 * @public
 */
function DetermineHandValue(player) {
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
}

/**
 * Creates an array of player objects from provided number of desired players.
 * @function RegisterPlayers
 * @param {int for total number of player objects to create} numOfPlayers 
 * @public
 */
function RegisterPlayers(numOfPlayers) {
    var players = [];
    for(let i = 0; i < numOfPlayers; i++) {
        players.push(createPlayer(i));
    }

    return players;
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

    for(let i = 0; i < 2; i++) {
        players.forEach(player => {
            player.hand.push(deck.pop());
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
    }
}

module.exports = {
    RegisterPlayers: RegisterPlayers,
    NewGame: NewGame,
    Hit: Hit,
    DetermineHandValue: DetermineHandValue
}