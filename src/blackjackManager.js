'use strict';

const deckManager = require('./deckManager.js');
let deck;

function createPlayer(playerSeatNum) {
    return {
        seat: playerSeatNum,
        hand: []
    }
}

function RegisterPlayers(numOfPlayers) {
    var players = [];
    for(let i = 0; i < numOfPlayers; i++) {
        players.push(createPlayer(i));
    }

    return players;
}

function NewGame(players) {
    deck = deckManager.createDeck();
    deck = deckManager.shuffleDeck(deck);

    for(let i = 0; i < 2; i++) {
        players.forEach(player => {
            player.hand.push(deck.pop());
        });
    }
}

function Hit(player) {
    if(deck.length) {
        player.hand.push(deck.pop());
    }
}

module.exports = {
    RegisterPlayers: RegisterPlayers,
    NewGame: NewGame,
    Hit: Hit
}