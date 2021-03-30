describe('Tests for blackjack manager module', () => {
    const BlackjackManager = require('./blackjackManager');
    let PlayerMap;

    beforeEach(() => {
        PlayerMap = new Map();
        PlayerMap.set(0, { 
            id: 'botId',
            name: 'botName',
            hand: [],
            handValue: 0,
            bust: false
        });
        PlayerMap.set(1, {
            id: 'testId',
            name: 'testName',
            balance: 100,
            hand: [],
            handValue: 0,
            bust: false,
            currentWager: 0,
            skipRound: false
        });
    });

    describe('validate new game functionality', () => {
        test('provides starting hand to player in player map', () => {
            BlackjackManager.NewGame(PlayerMap);
            let player = PlayerMap.get(0);
            expect(player.hand.length).toEqual(2);
        });
        test('player hand value is not zero after new game starts', () => {
            BlackjackManager.NewGame(PlayerMap);
            let player = PlayerMap.get(0);
            expect(player.handValue).not.toEqual(0);
        });
        test('player hand is not dealt when they skip round', () => {
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [],
                handValue: 0,
                bust: false,
                currentWager: 0,
                skipRound: true
            });
            BlackjackManager.NewGame(PlayerMap);
            let player = PlayerMap.get(1);
            expect(player.hand.length).toEqual(0);
        });
        test('player hand value is zero when they skip round', () => {
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [],
                handValue: 0,
                bust: false,
                currentWager: 0,
                skipRound: true
            });
            BlackjackManager.NewGame(PlayerMap);
            let player = PlayerMap.get(1);
            expect(player.handValue).toEqual(0);
        });
    });
    describe('validate hit functionality', () => {
        beforeEach(() => {
            BlackjackManager.NewGame(PlayerMap);
        });
        test('player hand value updates after hit', () => {
            const playerStartHandValue = PlayerMap.get(1).handValue;
            BlackjackManager.Hit(PlayerMap.get(1));
            expect(playerStartHandValue).not.toEqual(PlayerMap.get(1).handValue);
        });
        test('player bust value updates if they hit over 21', () => {
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: 'Ace',
                    displayString: 'Ace of hearts'
                }],
                handValue: 21,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
            BlackjackManager.Hit(PlayerMap.get(1));
            expect(PlayerMap.get(1).bust).toEqual(true);
        });
        test('player ace is valued at 11', () => {
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: 'Ace',
                    displayString: 'Ace of hearts'
                }],
                handValue: 11,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
            BlackjackManager.Hit(PlayerMap.get(1));
            expect(PlayerMap.get(1).handValue).toBeGreaterThan(11);
        });
    });
    describe('validate dealer turn functionality', () => {
        beforeEach(() => {
            BlackjackManager.NewGame(PlayerMap);
        });
        test('dealer does not hit when other players max value is lower', () => {
            PlayerMap.set(0, {
                id: 'botId',
                name: 'botName',
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '6',
                    displayString: '6 of hearts'
                }],
                handValue: 16,
                bust: false
            });
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '5',
                    displayString: '5 of hearts'
                }],
                handValue: 15,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
            BlackjackManager.DealerTurn(PlayerMap, 0);
            expect(PlayerMap.get(0).handValue).toEqual(16);
        });
        test('dealer does not hit when other players max value is greater and dealer hand value is above 17', () => {
            PlayerMap.set(0, {
                id: 'botId',
                name: 'botName',
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '7',
                    displayString: '7 of hearts'
                }],
                handValue: 17,
                bust: false
            });
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '8',
                    displayString: '8 of hearts'
                }],
                handValue: 18,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
            BlackjackManager.DealerTurn(PlayerMap, 0);
            expect(PlayerMap.get(0).handValue).toEqual(17);
        });
        test('dealer hits when other players max value is greater and dealer hand is below 17', () => {
            PlayerMap.set(0, {
                id: 'botId',
                name: 'botName',
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '6',
                    displayString: '6 of hearts'
                }],
                handValue: 16,
                bust: false
            });
            PlayerMap.set(1, {
                id: 'testId',
                name: 'testName',
                balance: 100,
                hand: [{
                    suit: 'hearts',
                    color: 'red',
                    value: '10',
                    displayString: '10 of hearts'
                },{
                    suit: 'hearts',
                    color: 'red',
                    value: '7',
                    displayString: '7 of hearts'
                }],
                handValue: 17,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
            BlackjackManager.DealerTurn(PlayerMap, 0);
            expect(PlayerMap.get(0).handValue).toBeGreaterThan(16);
        });
    });
});