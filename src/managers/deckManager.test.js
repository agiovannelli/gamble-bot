describe('Tests for deck manager module', () => {
    const deckManager = require('./deckManager');

    describe('validate deck creation functionality', () => {
        test('52 card standard deck array returned by default', () => {
            let deck = deckManager.CreateDeck();
            expect(deck.length).toEqual(52);
        });
        test('52 card standard deck array returned when "standard" type provided', () => {
            let deck = deckManager.CreateDeck('standard');
            expect(deck.length).toEqual(52);
        });
        test('52 card standard deck array returned when invalid type provided', () => {
            let deck = deckManager.CreateDeck('test');
            expect(deck.length).toEqual(52);
        });
    });

    describe('validate deck shuffling functionality', () => {
        test('returns passed value when not provided array', () => {
            let deck = {};
            let result = deckManager.ShuffleDeck(deck);
            expect(result).toEqual(deck);
        });
        test('returns original array when length is 0', () => {
            let deck = [];
            let result = deckManager.ShuffleDeck(deck);
            expect(result).toEqual(deck);
        });
        test('returns shuffled deck object when provided deck', () => {
            const deck = deckManager.CreateDeck();
            expect(deckManager.ShuffleDeck(deckManager.CreateDeck())).not.toEqual(deck);
        });
    });
});