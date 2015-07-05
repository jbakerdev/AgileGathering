import React from 'react';
import AgileGatheringBoard from 'AgileGatheringBoard.react.js';
import AgileGatheringBuilder from 'AgileGatheringBuilder.react.js';
import AgileGatheringLobby from 'AgileGatheringLobby.react.js';
import Store from '../stores/AgileGatheringStore.js';

let AgileGatheringHost = React.createClass({

    componentWillMount() {
        Store.addChangeListener(this._onChange);
    },

    componentWillUnmount() {
        Store.removeChangeListener(this._onChange);
    },

    getInitialState(){
        return {
            selectedMatch: null,
            selectedDeck: null,
            matches: Store.getMatches(),
            deckList: Store.getDecks(),
            allCards: Store.getCards()
        }
    },

    render() {
        if(!this.state.playerDeck){
            return (<AgileGatheringBuilder decks={ this.state.deckList }
                selectedDeck={ this.state.selectedDeck }
                allCards={ this.state.allCards } />);
        }
        else if(this.state.selectedMatch && this.state.selectedMatch.hasStarted){
            return (<AgileGatheringBoard match={ this.state.selectedMatch } />);
        }
        else{
            return (<AgileGatheringLobby matches={ this.state.matches }
                playerName={ this.state.playerName }
                playerId={ this.state.playerId }
                setSelectedMatch={ this.setSelectedMatch }
                selectedMatch={ this.state.selectedMatch }/>);
        }
    },

    setSelectedMatch(){

    },

    _onChange() {
        this.setState(Store.get());
    }
});

export default AgileGatheringHost;