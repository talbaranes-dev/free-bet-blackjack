// Card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

// Hand evaluation
export interface HandValue {
  hard: number;
  soft: number;
  best: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBusted: boolean;
}

// Game status
export type GameStatus = 'BETTING' | 'DEALING' | 'PLAYER_TURNS' | 'DEALER_TURN' | 'RESOLVING' | 'COMPLETE';
export type HandStatus = 'ACTIVE' | 'STOOD' | 'BUSTED' | 'BLACKJACK' | 'SURRENDERED';
export type HandResult = 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK_WIN';
export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender';

// Player hand in a game
export interface GameHand {
  id: string;
  cards: Card[];
  bet: number;
  freeBet: boolean;
  hasRealStake: boolean;
  status: HandStatus;
  result?: HandResult;
  payout: number;
  splitFrom?: string;
}

// Player at the table
export interface PlayerSeat {
  seatIndex: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  hands: GameHand[];
  isReady: boolean;
  isConnected: boolean;
  currentBet: number;
}

// Room state
export interface RoomState {
  id: string;
  inviteCode: string;
  name: string;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  seats: (PlayerSeat | null)[];
  gameState: GameState | null;
}

// Game state broadcast to clients
export interface GameState {
  id: string;
  status: GameStatus;
  dealerHand: Card[];
  dealerValue?: HandValue;
  currentSeatIndex: number;
  currentHandIndex: number;
  timeRemaining: number;
  roundNumber: number;
}

// Available actions for current turn
export interface AvailableActions {
  hit: boolean;
  stand: boolean;
  double: boolean;
  split: boolean;
  surrender: boolean;
  isFreeDouble: boolean;
  isFreeSplit: boolean;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  chips: number;
  totalWinnings: number;
  gamesPlayed: number;
  gamesWon: number;
}

// Auth
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  chips: number;
  avatarUrl?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
