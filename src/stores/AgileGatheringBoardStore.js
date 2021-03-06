import _ from '../vendor/lodash.min.js';

import Dispatcher from '../backend/AgileGatheringDispatcher';
import BoardActions from '../actions/BoardActionCreators';
import RealtimeAPI from '../backend/RealtimeAPI';
import StoreCreator from '../backend/StoreCreator';
import { ActionTypes } from '../Constants';

let cards, activePlayerId, match, hasNotDrawnThisTurn = true, currentPlayerId, victoryForPlayer, message="", messageColor="";

import buzz from '../vendor/buzz.min.js';

const matchSounds = {
    //cardSelect: new buzz.sound("./res/snd/select.mp3")
};

const getCardByOwner = (card, ownerId) => {

    if(typeof card !== 'object'){
        card = getCardById(card);
    }

    let owner = _.filter(match.players, function(player){
        return player.playerId === ownerId;
    })[0];
    //TODO need to return new instance potentially if found in deck
    let deckIdMatches = _.filter(owner.playerDeck.cardIds, function(cardId){
        return cardId === card.cardId;
    })[0];

    if(deckIdMatches){
        return getCardById(deckIdMatches);
    }

    let resourceMatches = _.filter(owner.playerResources, function(cardItem){
        return card.cardId === cardItem.cardId;
    })[0];

    if(resourceMatches) return resourceMatches;

    let storyMatches = _.filter(owner.playerStories, function(cardItem){
        return card.cardId === cardItem.cardId;
    })[0];

    if(storyMatches) return storyMatches;

    let handMatches = _.filter(owner.playerHand, function(cardItem){
        return card.cardId === cardItem.cardId;
    })[0];

    if(handMatches) return handMatches;

    else throw 'getCardByOwner() Card not found!!';
};

const getCardById = (cardId)=>{
    return _.filter(cards, function(card){
        return cardId === card.cardId;
    })[0];
};

const getPlayer = (playerId) =>{
    return _.filter(match.players, function(player){
        return player.playerId === playerId;
    })[0];
};

const setModifiedCardStats = (card, newModCard)=>{
    if(newModCard.type === 'delay' || newModCard.type === 'boost'){
        card.points += newModCard.points;
    }
};

const checkAllPlayerCardStats = (player, newCard)=>{
    if(newCard.pptBonus){
        _.each(player.playerResources, function(card){
            if(card.ppt) card.ppt += newCard.pptBonus;
        });
    }
};

const getRandomCard = (cardIdArray) =>{
    const index = Math.round(Math.random() * (cardIdArray.length-1));
    const el = cardIdArray[index];
    cardIdArray.splice(index, 1);
    return el;
};

var AgileGatheringBoardStore = StoreCreator.create({
    get: (matchProp, activePlayerIdProp, currentPlayerIdProp, cardsProp) => {
        if(matchProp) match = matchProp;
        if(cardsProp) cards = cardsProp;
        if(activePlayerIdProp){
            activePlayerId = activePlayerIdProp;
            currentPlayerId = currentPlayerIdProp;
        }
        return {
            match,
            activePlayerId,
            currentPlayerId,
            hasNotDrawnThisTurn,
            victoryForPlayer,
            message,
            messageColor
        };
    }
});

AgileGatheringBoardStore.dispatchToken = Dispatcher.register((payload) => {
    const action = payload;

    let changed = false;

    switch(action.type) {
        case ActionTypes.CARD_MOVED:

            let player = getPlayer(action.playerId);
            let card = getCardByOwner(action.cardId, action.playerId);
            player[action.targetArea].push(card);

            var cardIndex=-1;
            _.each(player.playerHand, function(card, i){
                if(card.cardId === action.cardId) cardIndex=i;
            });
            if(cardIndex > -1) player.playerHand.splice(cardIndex, 1);

            if(!card.isPayedFor && action.playerId === currentPlayerId){
                player.resourcePool -= card.cost;
                card.isPayedFor = true;
            }

            checkAllPlayerCardStats(player,card);

            changed = true;
            break;
        case ActionTypes.CARD_MODIFIED:

            let modifiedCard = getCardByOwner(action.targetCard, action.playerId);
            modifiedCard.modifiers.push(action.droppedCard);

            let otherRemotePlayer = getPlayer(action.playerId);
            if(!action.droppedCard.isPayedFor && action.playerId === currentPlayerId){
                otherRemotePlayer.resourcePool -= action.droppedCard.cost;
                action.droppedCard.isPayedFor = true;
            }

            setModifiedCardStats(modifiedCard, action.droppedCard);
            if(otherRemotePlayer.playerId === currentPlayerId){
                if(!otherRemotePlayer.modifierCards) otherRemotePlayer.modifierCards = [];
                otherRemotePlayer.modifierCards.push(action.droppedCard);
            }
            changed = true;
            break;
        case ActionTypes.DRAW_CARDS:

            let remotePlayer = getPlayer(action.player.playerId);

            if(remotePlayer.playerId === activePlayerId){
                if(!hasNotDrawnThisTurn){
                    return;
                }
                hasNotDrawnThisTurn = false;
            }

            if(remotePlayer.playerDeck.cardIds.length >= action.number){
                if(remotePlayer.playerHand.length < 7){
                    setTimeout(()=>{
                        BoardActions.showFlaire("Drew "+action.number + " cards.", "bisque");
                    }, 1000);
                    for(var i = 0; i < action.number; i++) {
                        let cardId = getRandomCard(remotePlayer.playerDeck.cardIds);
                        let card = getCardById(cardId);

                        remotePlayer.playerHand.push({
                            cardId: card.cardId,
                            modifiers: [],
                            name: card.name,
                            text: card.text,
                            imagePath: card.imagePath,
                            type: card.type,
                            points: card.points,
                            justDrawn: true,
                            upkeep: card.upkeep,
                            value: card.value,
                            pptBonus: card.pptBonus,
                            ppt: card.ppt,
                            cost: card.cost,
                            ownerId: remotePlayer.playerId
                        });
                    }
                }
            }
            else{
                remotePlayer.playerDeck.cardIds = [];
                remotePlayer.playerHand = [];
                let playerWon = _.filter(match.players, function(player){
                    return player.playerId != remotePlayer.playerId;
                })[0];
                playerWon.victoryMessage = "The other player ran out of cards!";
                RealtimeAPI.playerWon(playerWon);
            }
            changed = true;
            break;
        case ActionTypes.END_TURN:
            let playerTurnOver = getPlayer(action.playerId);
            playerTurnOver.playerTurn++;
            playerTurnOver.resourcePool = playerTurnOver.playerTurn;
            _.each(playerTurnOver.playerStories, function(storyCard){
                if(!storyCard.maxPoints) storyCard.maxPoints = storyCard.points;
                if(!storyCard.isCompleted){
                    _.each(storyCard.modifiers, function(modifierCard){
                        if(modifierCard.type === 'resource' && storyCard.points > 0 && !storyCard.isCompleted){
                            if(modifierCard.ppt){
                                 storyCard.points -= modifierCard.ppt;
                                if(storyCard.points < 0) storyCard.points = 0;
                                if(storyCard.points <= 0){
                                    let freedResources = _.filter(storyCard.modifiers, function(card){
                                        return card.type === 'resource';
                                    });

                                    _.each(freedResources, function(freeCard){
                                        if(_.filter(playerTurnOver.playerResources, function(resCard){
                                                return freeCard.cardId === resCard.cardId;
                                            }).length === 0){
                                            playerTurnOver.playerResources.push(freeCard);
                                        }
                                    });

                                    storyCard.modifiers = _.filter(storyCard.modifiers, function(card){
                                        return card.type !== 'resource';
                                    });

                                    _.each(freedResources, function(freedCard){
                                        playerTurnOver.modifierCards = _.filter(playerTurnOver.modifierCards, function(modCard){
                                            return modCard.cardId !== freedCard.cardId;
                                        });
                                    });

                                    storyCard.isCompleted = true;

                                    playerTurnOver.playerPoints += storyCard.maxPoints;

                                    setTimeout(()=>{
                                        BoardActions.showFlaire("Story Completed! "+storyCard.maxPoints + " gained.", "bisque");
                                    }, 1000);

                                    if(playerTurnOver.playerPoints >= 20){
                                        playerTurnOver.victoryMessage = "20 SP Achieved!";
                                        RealtimeAPI.playerWon(playerTurnOver);
                                    }
                                }
                            }
                        }
                    })
                }
            });

            //Set activePlayer to the next person
            const enemy = _.filter(match.players, function(player){
                return player.playerId !== playerTurnOver.playerId;
            })[0];
            activePlayerId = enemy.playerId;
            if(activePlayerId === currentPlayerId) hasNotDrawnThisTurn = true;

            changed = true;
            break;
        case ActionTypes.PLAYER_WON:
            victoryForPlayer = action.player;
            changed = true;
            break;
        case ActionTypes.SHOW_FLAIRE:
            message = action.message;
            messageColor = action.color;
            changed = true;
            break;
    }

    if(changed) AgileGatheringBoardStore.emitChange();
});

export default AgileGatheringBoardStore;
