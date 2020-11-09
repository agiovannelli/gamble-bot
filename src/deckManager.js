'use strict';

let cardValues = ['Ace','King', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
let frenchSuits = [{
        name: 'hearts',
        color: 'red'
    }, {
        name: 'spades', 
        color: 'black'
    }, {
        name: 'clubs',
        color: 'black'
    }, {
        name: 'diamonds',
        color: 'red'
    }
];

/**
 * Creates a 52-card, French-suited deck.
 * @function createStandardDeck
 * @private
 */
function createStandardDeck() {
    let frenchSuitedDeck = [];
    frenchSuits.forEach(function(suit) {
        cardValues.forEach(function(cardValue) {
            frenchSuitedDeck.push({
                suit: suit.name,
                color: suit.color,
                value: cardValue,
                displayString: cardValue + ' of ' + suit.name
            });
        });
    });
    return frenchSuitedDeck;
}

/**
 * Creates a deck (array of cards).
 * @function createDeck
 * @param {Deck type to create (i.e. standard)} type 
 * @public
 */
function createDeck(type) {
    let deck;
    switch (type) {
        case 'standard':
        default:
            deck = createStandardDeck();
            break;
    }

    return deck;
}

module.exports = {
    createDeck: createDeck
};