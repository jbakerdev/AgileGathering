
export default {

  ActionTypes: {
    CREATED_MATCH: 'cm',
    SELECTED_MATCH: 'sm',
    MATCH_READY: 'mr',
    MATCH_AVAILABLE: 'ma',
    JOINED_MATCH: 'jm',
    UPDATE_MATCH: 'um',
    DELETE_MATCH: 'dm',
    MATCH_START: 'ms',
    CREATE_NEW_PLAYER: 'cnp',
    DELETE_PLAYER: 'dp',
    START_TIMER_TICK: 'stt',
    GAME_TIMER_TICK: 'gtt',
    TIMER_UPDATE: 'tu',
    DISABLE_JOIN_BUTTON: 'djb'
  },

  Decks: [
    {
      deckId: 'SBP',
      name: 'Standard Business Practices',
      cards: ['juniorEngineer', 'juniorEngineer2', 'engineerII', 'engineerII2', 'seniorEngineer', 'asset', 'asset2', 'asset3',
              'IPO', 'fancyDropDown', 'loginScreen', 'hotCheckbox', 'scopeCreep', 'scopeCreep2']
    },
    {
      deckId: 'VCM',
      name: 'VC Money',
      cards: ['juniorEngineer', 'juniorEngineer2', 'engineerII', 'engineerII2', 'seniorEngineer', 'asset', 'asset2', 'asset3',
        'VC', 'fancyDropDown', 'loginScreen', 'hotCheckbox', 'scopeCreep', 'scopeCreep2']
    }
  ],

  Cards: [
    {
      cardId: 'juniorEngineer',
      modifiers: [],
      name: 'Junior Engineer',
      text: 'I\'ll just watch.',
      imagePath: './res/img/rgreen.png',
      type: 'resource',
      ppt: 1,
      cost: 1
    },
    {
      cardId: 'juniorEngineer2',
      modifiers: [],
      name: 'Junior Engineer',
      text: 'I\'ll just watch.',
      imagePath: './res/img/rgreen.png',
      type: 'resource',
      ppt: 1,
      cost: 1
    },
    {
      cardId: 'engineerII',
      modifiers: [],
      name: 'Engineer II',
      text: 'Paring is sharing.',
      imagePath: './res/img/techLlama.png',
      type: 'resource',
      ppt: 2,
      cost: 2
    },
    {
      cardId: 'engineerII2',
      modifiers: [],
      name: 'Engineer II',
      text: 'Paring is sharing.',
      imagePath: './res/img/techLlama.png',
      type: 'resource',
      ppt: 2,
      cost: 2
    },
    {
      cardId: 'seniorEngineer',
      modifiers: [],
      name: 'Senior Engineer',
      text: 'I used to work at a startup.',
      imagePath: './res/img/rgreen.png',
      type: 'resource',
      ppt: 4,
      cost: 5
    },
    {
      cardId: 'asset',
      modifiers: [],
      name: 'Asset',
      text: 'It has been monetized!',
      imagePath: './res/img/software.png',
      type: 'resource',
      value: 2
    },
    {
      cardId: 'asset2',
      modifiers: [],
      name: 'Asset',
      text: 'It has been monetized!',
      imagePath: './res/img/software.png',
      type: 'resource',
      value: 1
    },
    {
      cardId: 'asset3',
      modifiers: [],
      name: 'Asset',
      text: 'It has been monetized!',
      imagePath: './res/img/software.png',
      type: 'resource',
      value: 3
    },
    {
      cardId: 'IPO',
      modifiers: [],
      name: 'IPO',
      text: 'We know what we\'re doing, give us money.',
      imagePath: './res/img/stock.png',
      type: 'resource',
      value: 20,
      upkeep: 1
    },
    {
      cardId: 'VC',
      modifiers: [],
      name: 'VC Money',
      text: 'We know what we\'re doing, give us money.',
      imagePath: './res/img/stock.png',
      type: 'resource',
      value: 10,
      upkeep: 1
    },

  ],
//'fancyDropDown', 'loginScreen', 'hotCheckbox', 'scopeCreep', 'scopeCreep2'
  FileServerIP: '10.32.32.156'
};
