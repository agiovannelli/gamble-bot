'use strict';

describe('Tests for player manager module', () => {
    const playerManager = require('./playerManager');
    
    describe('Player registration tests', () => {
        test('Console error is invoked when no game string match made', () => {
            // Setup
            global.console = { error: jest.fn() };

            // Execute
            playerManager.RegisterPlayers()

            // Validate
            expect(console.error).toBeCalled();
        });
        test('Player data updated when game string is blackjack', () => {
            // Setup
            let mockPlayerData = new Map();
            mockPlayerData.set(0, {
                id: 'id',
                name: 'user'
            });

            mockPlayerData.set = jest.fn();

            // Execute
            playerManager.RegisterPlayers(mockPlayerData, 'blackjack');

            // Validate
            expect(mockPlayerData.set).toHaveBeenLastCalledWith(0, {
                id: 'id',
                name: 'user',
                balance: 100,
                hand: [],
                handValue: 0,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
        });
    });
    describe('Player map dependent tests', () => {
        let playerMap; 
        beforeEach(() => {
            playerMap = new Map();
            playerMap.set(1, {
                id: 'id',
                name: 'user',
                balance: 100,
                hand: [],
                handValue: 0,
                bust: false,
                currentWager: 0,
                skipRound: false
            });
        });
        describe('Handle player bet tests', () => {
            test('Rejects player bet when player key not defined', () => {
                // Execute
                let result = playerManager.HandlePlayerBet(playerMap);
    
                // Validate
                expect(result).toBeFalsy();
            });
            test('Rejects player bet when player wager is not a number', () => {
                // Execute
                let result = playerManager.HandlePlayerBet(playerMap, 1, 'fish');
    
                // Validate
                expect(result).toBeFalsy();
            });
            test('Rejects player bet when player wager is greater than player balance', () => {
                // Execute
                let result = playerManager.HandlePlayerBet(playerMap, 1, 200);
    
                // Validate
                expect(result).toBeFalsy();
            });
            test('Accepts player bet when valid wager and key info provided', () => {
                // Execute
                let result = playerManager.HandlePlayerBet(playerMap, 1, 10);
    
                // Validate
                expect(result).toBeTruthy();
            });
        });
        describe('Determine player map key tests', () => {
            test('Returns undefined when id not found in player map', () => {
                // Execute
                let result = playerManager.DeterminePlayerMapKey(playerMap, 2);
    
                // Validate
                expect(result).toBeFalsy();
            });
            test('Returns player key for given id', () => {
                // Execute
                let result = playerManager.DeterminePlayerMapKey(playerMap, 'id');
    
                // Validate
                expect(result).toBe(1);
            });
        });
        describe('Reset player bet values tests', () => {
            test('Updates all player wager and round skip properties', () => {
                // Setup
                let expectedPlayerData = {
                    id: 'id',
                    name: 'user',
                    balance: 100,
                    hand: [],
                    handValue: 0,
                    bust: false,
                    currentWager: 0,
                    skipRound: true
                };
                playerMap.set(0, expectedPlayerData);
                playerMap.set = jest.fn();

                // Execute
                playerManager.ResetPlayerBetValues(playerMap);

                // Validate
                expect(playerMap.set).toHaveBeenLastCalledWith(1, expectedPlayerData);
            });
        });
        describe('Reward player tests', () => {
            let playerGambleData 
            beforeEach(() => {
                playerGambleData = {
                    id: 'id',
                    name: 'user',
                    balance: 50,
                    hand: [],
                    handValue: 0,
                    bust: false,
                    currentWager: 50,
                    skipRound: false
                };

                playerMap.set(2, playerGambleData);
                playerMap.set = jest.fn();
            });
            test('Maintains player balance if game result is draw', () => {
                // Execute
                playerManager.RewardPlayer(playerMap, 2, 'draw');

                // Validate
                expect(playerMap.set).toHaveBeenLastCalledWith(2, {
                    id: 'id',
                    name: 'user',
                    balance: 100,
                    hand: [],
                    handValue: 0,
                    bust: false,
                    currentWager: 50,
                    skipRound: false
                });
            });
            test('Increases balance according to player wager if game result is win', () => {
                // Execute
                playerManager.RewardPlayer(playerMap, 2, 'win');

                // Validate
                expect(playerMap.set).toHaveBeenLastCalledWith(2, {
                    id: 'id',
                    name: 'user',
                    balance: 150,
                    hand: [],
                    handValue: 0,
                    bust: false,
                    currentWager: 50,
                    skipRound: false
                });
            });
        });
    });
});