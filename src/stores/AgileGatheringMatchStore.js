import _ from '../vendor/lodash.min.js';

import Dispatcher from 'flux';
import StoreCreator from '../backend/StoreCreator';
import ActionTypes from '../Constants';
import FileServerIP from '../Constants';
import Decks from '../Constants';
import Cards from '../Constants';

import buzz from '../vendor/buzz.min.js';

const lobbySounds = {
    startMatch: new buzz.sound("http://"+FileServerIP+":7777/matchMusic.mp3"),
    joinMatch: new buzz.sound("http://"+FileServerIP+":7777/joinMatch.mp3"),
    lobbyMusic: new buzz.sound("http://"+FileServerIP+":7777/lobbyMusic.mp3")
};

function getMatchByOwner(ownerId){
    return _.find(matches, function(match){
        return match.ownerId === ownerId;
    });
}

function getMatchById(matchId){
    return _.find(matches, function(match){
        return match.matchId === matchId;
    });
}

//available matches
var matches = [];
var selectedMatch = null;
var started = false;
let decks = Decks;
let selectedDeck = null;
let playerDeck = null;
let cards = Cards;
var catUrls = [
    'http://www.sbs.com.au/news/sites/sbs.com.au.news/files/Grumpy%20Cat.jpg',
    'http://cdn.cutestpaw.com/wp-content/uploads/2013/12/Most-Famous-Felines-001.jpg',
    'http://i.ytimg.com/vi/4eGQ5VFt7P4/0.jpg',
    'http://i1.kym-cdn.com/entries/icons/original/000/000/888/VanillaHappyCat.jpg',
    'http://fc02.deviantart.net/fs70/f/2013/309/4/1/business_cat_by_wytrab8-d6t5znh.jpg'
];

var currentPlayerId = Rally.environment.getContext().getUser().ObjectID;
var currentPlayerName = Rally.environment.getContext().getUser().DisplayName;

var disableJoinButton = false;

var AgileGatheringMatchStore = StoreCreator.create({
    get: () => {
        return {
            matches: matches,
            currentPlayerId: currentPlayerId,
            currentPlayerName: currentPlayerName,
            selectedMatch: selectedMatch,
            started: started,
            catUrls: catUrls,
            disableJoinButton: disableJoinButton,
            decks: decks,
            playerDeck: playerDeck,
            cards: cards
        };
    }
});

AgileGatheringMatchStore.Deck = function(deckName){
    this.cards = [];
    this.name = deckName;
    this.deckId = Math.random() + '_deck';
};

AgileGatheringMatchStore.Card = function(cardName){
    this.name = cardName;
    this.cardId = Math.random() + '_card';
};

AgileGatheringMatchStore.dispatchToken = Dispatcher.register((payload) => {
    var action = payload.action;

    var changed = false;

    switch(action.type) {
        case ActionTypes.CREATED_MATCH:
            if(action.ownerId === currentPlayerId && !getMatchByOwner(action.ownerId)){
                matches.push({matchId: action.matchId, ownerId: action.ownerId, matchName: action.matchName});
                selectedMatch = getMatchByOwner(action.ownerId);
                selectedMatch.players = [];
                selectedMatch.players.push({playerName: currentPlayerName, matchId: action.matchId, playerId: currentPlayerId});
                lobbySounds.joinMatch.play();
                disableJoinButton = true;
                changed = true;
            }
            break;
        case ActionTypes.JOINED_MATCH:
            var match = getMatchById(action.match.matchId);
            match.players.push({playerId: action.playerId, playerName: action.playerName});
            lobbySounds.joinMatch.play();
            changed = true;
            break;
        case ActionTypes.DELETE_MATCH:
            //removeDeletedMatch(action.matchId);
            changed = true;
            break;
        case ActionTypes.SELECTED_MATCH:
            selectedMatch = getMatchById(action.matchId);
            selectedMatch.ownerId === currentPlayerId ? disableJoinButton = true : disableJoinButton = false;
            changed = true;
            break;
        case ActionTypes.MATCH_AVAILABLE:
            if(!getMatchByOwner(action.ownerId)){
                matches.push({ matchId: action.matchId, ownerId: action.ownerId, matchName: action.matchName, players: action.players});
            }
            changed = true;
            break;
        case ActionTypes.MATCH_READY:
            if(selectedMatch.Id === action.matchId){
                var player = _.find(players, function(player){
                    return player.Id === action.playerId
                });
                player.ready = true;
            }
            if(_.all(players, function(player){
                  return player.ready;
              })){
                Dispatcher.handleViewAction({
                    type: ActionTypes.MATCH_START,
                    matchId: action.matchId
                });
            }
            changed = true;
            break;
        case ActionTypes.MATCH_START:
            started = true;
            changed = true;
            lobbySounds.startMatch.play();
            lobbySounds.lobbyMusic.stop();
            break;
        case ActionTypes.DISABLE_JOIN_BUTTON:
            disableJoinButton = true;
            changed = true;
            break;
        case ActionTypes.CHOOSE_DECK:
            playerDeck = action.deck;
            changed = true;
            break;
        case ActionTypes.SELECTED_DECK:
            selectedDeck = action.deck;
            changed = true;
            break;
        case ActionTypes.DELETE_DECK:
            decks = _.filter(decks, function(deck){
                return deck.deckId !== action.deck.deckId;
            });
            changed = true;
            break;
        case ActionTypes.CREATE_DECK:
            decks.push(new AgileGatheringMatchStore.Deck('Custom Deck'));
            changed = true;
            break;
        case ActionTypes.TOGGLE_CARD:
            let found = false;
            _.each(action.deck.cards, function(card){
                if(card.cardId === action.cardId){
                    found = true;
                }
            });
            if(!found){
                action.deck.cards.push(action.card);
            }
            else{
                action.deck.cards = _.filter(action.deck.cards, function(card){
                    return card.cardId !== action.card.cardId;
                })
            }
            changed = true;
            break;
    }

    if(changed) AgileGatheringMatchStore.emitChange();
});

lobbySounds.lobbyMusic.setVolume(100).play().loop();

export default AgileGatheringMatchStore;