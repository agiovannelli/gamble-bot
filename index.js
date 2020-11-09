const deckManager = require('./src/deckManager.js');

let deck = deckManager.createDeck();

deck.forEach(function(card) {
    console.log(card.displayString);
});