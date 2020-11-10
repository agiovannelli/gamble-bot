const deckManager = require('./src/deckManager.js');

let deck = deckManager.createDeck();

deck.forEach(function(card) {
    console.log(card.displayString);
});

console.log('\n\n');

let anotherDeck = deckManager.shuffleDeck(deck);

anotherDeck.forEach(function(card) {
    console.log(card.displayString);
});