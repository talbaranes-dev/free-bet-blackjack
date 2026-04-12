// Client -> Server events
export const C2S = {
  // Room
  CREATE_ROOM: 'room:create',
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
  TAKE_SEAT: 'room:seat',
  LEAVE_SEAT: 'room:unseat',
  READY_UP: 'room:ready',

  // Game
  PLACE_BET: 'game:bet',
  PLAYER_ACTION: 'game:action',

  // Social
  SEND_EMOJI: 'social:emoji',
} as const;

// Server -> Client events
export const S2C = {
  // Room
  ROOM_STATE: 'room:state',
  PLAYER_JOINED: 'room:joined',
  PLAYER_LEFT: 'room:left',
  PLAYER_SEATED: 'room:seated',
  PLAYER_UNSEATED: 'room:unseated',
  PLAYER_READY: 'room:readyChanged',

  // Game
  GAME_STARTING: 'game:starting',
  BETTING_OPEN: 'game:betting',
  BET_PLACED: 'game:betPlaced',
  CARDS_DEALT: 'game:dealt',
  TURN_START: 'game:turnStart',
  CARD_DRAWN: 'game:cardDrawn',
  HAND_SPLIT: 'game:handSplit',
  HAND_DOUBLED: 'game:handDoubled',
  HAND_SURRENDERED: 'game:handSurrendered',
  HAND_BUSTED: 'game:handBusted',
  HAND_STOOD: 'game:handStood',
  DEALER_REVEAL: 'game:dealerReveal',
  DEALER_DRAW: 'game:dealerDraw',
  HAND_RESULT: 'game:handResult',
  ROUND_COMPLETE: 'game:roundComplete',
  CHIPS_UPDATED: 'game:chipsUpdated',

  // Errors
  ERROR: 'error',

  // Social
  EMOJI_RECEIVED: 'social:emoji',
} as const;
