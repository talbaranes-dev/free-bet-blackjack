import { v4 as uuid } from 'uuid';
import { Deck } from './Deck';
import { HandEvaluator } from './HandEvaluator';
import { FreeBetRules } from './FreeBetRules';
import type {
  Card,
  GameStatus,
  GameHand,
  HandStatus,
  HandResult,
  HandValue,
  PlayerAction,
  AvailableActions,
} from '../../shared/types';

export interface EnginePlayer {
  seatIndex: number;
  userId: string;
  username: string;
  chips: number;
  bet: number;
  hands: GameHand[];
}

export interface EngineState {
  id: string;
  status: GameStatus;
  deck: Deck;
  dealerHand: Card[];
  dealerValue: HandValue | null;
  players: Map<number, EnginePlayer>; // seatIndex -> player
  currentSeatIndex: number;
  currentHandIndex: number;
  roundNumber: number;
}

export type GameEvent =
  | { type: 'CARDS_DEALT'; players: Map<number, EnginePlayer>; dealerHand: Card[] }
  | { type: 'TURN_START'; seatIndex: number; handIndex: number; actions: AvailableActions; timeRemaining: number }
  | { type: 'CARD_DRAWN'; seatIndex: number; handIndex: number; card: Card; value: HandValue }
  | { type: 'HAND_DOUBLED'; seatIndex: number; handIndex: number; card: Card; value: HandValue; freeBet: boolean }
  | { type: 'HAND_SPLIT'; seatIndex: number; hands: GameHand[] }
  | { type: 'HAND_BUSTED'; seatIndex: number; handIndex: number; value: HandValue }
  | { type: 'HAND_STOOD'; seatIndex: number; handIndex: number }
  | { type: 'HAND_SURRENDERED'; seatIndex: number; handIndex: number }
  | { type: 'DEALER_REVEAL'; card: Card; value: HandValue }
  | { type: 'DEALER_DRAW'; card: Card; value: HandValue }
  | { type: 'HAND_RESULT'; seatIndex: number; handIndex: number; result: HandResult; payout: number }
  | { type: 'ROUND_COMPLETE'; playerResults: Map<number, { chipChange: number; newTotal: number }> };

export class BlackjackEngine {
  private state: EngineState;
  private eventQueue: GameEvent[] = [];

  constructor(roundNumber: number = 1) {
    this.state = {
      id: uuid(),
      status: 'BETTING',
      deck: new Deck(6),
      dealerHand: [],
      dealerValue: null,
      players: new Map(),
      currentSeatIndex: -1,
      currentHandIndex: 0,
      roundNumber,
    };
  }

  getState(): EngineState {
    return this.state;
  }

  flushEvents(): GameEvent[] {
    const events = [...this.eventQueue];
    this.eventQueue = [];
    return events;
  }

  // --- BETTING PHASE ---

  placeBet(seatIndex: number, userId: string, username: string, chips: number, amount: number): boolean {
    if (this.state.status !== 'BETTING') return false;
    if (amount > chips) return false;

    this.state.players.set(seatIndex, {
      seatIndex,
      userId,
      username,
      chips,
      bet: amount,
      hands: [],
    });
    return true;
  }

  // --- DEALING PHASE ---

  deal(): void {
    if (this.state.players.size === 0) return;

    this.state.status = 'DEALING';

    if (this.state.deck.needsReshuffle()) {
      this.state.deck.reset();
    }

    // Deal 2 cards to each player
    const seatOrder = [...this.state.players.keys()].sort();
    for (let round = 0; round < 2; round++) {
      for (const seat of seatOrder) {
        const player = this.state.players.get(seat)!;
        const card = this.state.deck.draw(true);
        if (player.hands.length === 0) {
          player.hands.push({
            id: uuid(),
            cards: [],
            bet: player.bet,
            freeBet: false,
            hasRealStake: true,
            status: 'ACTIVE',
            payout: 0,
          });
        }
        player.hands[0].cards.push(card);
      }
    }

    // Deal dealer hand: first card face up, second face down
    this.state.dealerHand = [this.state.deck.draw(true), this.state.deck.draw(false)];

    // Check for player blackjacks
    for (const player of this.state.players.values()) {
      const value = HandEvaluator.evaluate(player.hands[0].cards);
      if (value.isBlackjack) {
        player.hands[0].status = 'BLACKJACK';
      }
    }

    this.eventQueue.push({
      type: 'CARDS_DEALT',
      players: this.state.players,
      dealerHand: this.state.dealerHand,
    });

    // Check if dealer has blackjack (peek)
    const dealerUpCard = this.state.dealerHand[0];
    if (dealerUpCard.rank === 'A' || HandEvaluator.isTenValue(dealerUpCard)) {
      const revealedDealer = this.state.dealerHand.map((c) => ({ ...c, faceUp: true }));
      const dealerValue = HandEvaluator.evaluate(revealedDealer);
      if (dealerValue.isBlackjack) {
        // Reveal dealer hand and resolve immediately
        this.state.dealerHand = revealedDealer;
        this.state.dealerValue = dealerValue;
        this.eventQueue.push({ type: 'DEALER_REVEAL', card: this.state.dealerHand[1], value: dealerValue });
        this.resolveRound();
        return;
      }
    }

    // Move to player turns
    this.startPlayerTurns();
  }

  // --- PLAYER TURNS ---

  private startPlayerTurns(): void {
    this.state.status = 'PLAYER_TURNS';
    const seatOrder = [...this.state.players.keys()].sort();

    // Find first player that needs to act
    for (const seat of seatOrder) {
      const player = this.state.players.get(seat)!;
      if (player.hands[0].status === 'ACTIVE') {
        this.state.currentSeatIndex = seat;
        this.state.currentHandIndex = 0;
        this.emitTurnStart();
        return;
      }
    }

    // All players have blackjack or no active hands
    this.startDealerTurn();
  }

  private emitTurnStart(): void {
    const player = this.state.players.get(this.state.currentSeatIndex)!;
    const hand = player.hands[this.state.currentHandIndex];
    const actions = FreeBetRules.getAvailableActions(
      hand.cards,
      hand.cards.length === 2,
      player.chips,
      hand.bet,
      player.hands.length
    );

    this.eventQueue.push({
      type: 'TURN_START',
      seatIndex: this.state.currentSeatIndex,
      handIndex: this.state.currentHandIndex,
      actions,
      timeRemaining: 20,
    });
  }

  processAction(seatIndex: number, action: PlayerAction): boolean {
    if (this.state.status !== 'PLAYER_TURNS') return false;
    if (seatIndex !== this.state.currentSeatIndex) return false;

    const player = this.state.players.get(seatIndex)!;
    const hand = player.hands[this.state.currentHandIndex];

    if (hand.status !== 'ACTIVE') return false;

    switch (action) {
      case 'hit':
        return this.handleHit(player, hand);
      case 'stand':
        return this.handleStand(player, hand);
      case 'double':
        return this.handleDouble(player, hand);
      case 'split':
        return this.handleSplit(player, hand);
      case 'surrender':
        return this.handleSurrender(player, hand);
      default:
        return false;
    }
  }

  private handleHit(player: EnginePlayer, hand: GameHand): boolean {
    const card = this.state.deck.draw(true);
    hand.cards.push(card);
    const value = HandEvaluator.evaluate(hand.cards);

    this.eventQueue.push({
      type: 'CARD_DRAWN',
      seatIndex: player.seatIndex,
      handIndex: this.state.currentHandIndex,
      card,
      value,
    });

    if (value.isBusted) {
      hand.status = 'BUSTED';
      this.eventQueue.push({
        type: 'HAND_BUSTED',
        seatIndex: player.seatIndex,
        handIndex: this.state.currentHandIndex,
        value,
      });
      this.advanceTurn();
    } else if (value.best === 21) {
      hand.status = 'STOOD';
      this.eventQueue.push({
        type: 'HAND_STOOD',
        seatIndex: player.seatIndex,
        handIndex: this.state.currentHandIndex,
      });
      this.advanceTurn();
    }

    return true;
  }

  private handleStand(_player: EnginePlayer, hand: GameHand): boolean {
    hand.status = 'STOOD';
    this.eventQueue.push({
      type: 'HAND_STOOD',
      seatIndex: this.state.currentSeatIndex,
      handIndex: this.state.currentHandIndex,
    });
    this.advanceTurn();
    return true;
  }

  private handleDouble(player: EnginePlayer, hand: GameHand): boolean {
    const isFree = FreeBetRules.isFreeDouble(hand.cards);

    if (!isFree) {
      if (player.chips < hand.bet) return false;
      player.chips -= hand.bet;
      hand.bet *= 2;
    } else {
      hand.freeBet = true;
      // Bet stays same (casino covers the extra)
    }

    const card = this.state.deck.draw(true);
    hand.cards.push(card);
    const value = HandEvaluator.evaluate(hand.cards);

    this.eventQueue.push({
      type: 'HAND_DOUBLED',
      seatIndex: player.seatIndex,
      handIndex: this.state.currentHandIndex,
      card,
      value,
      freeBet: isFree,
    });

    if (value.isBusted) {
      hand.status = 'BUSTED';
      this.eventQueue.push({
        type: 'HAND_BUSTED',
        seatIndex: player.seatIndex,
        handIndex: this.state.currentHandIndex,
        value,
      });
    } else {
      hand.status = 'STOOD';
    }

    this.advanceTurn();
    return true;
  }

  private handleSplit(player: EnginePlayer, hand: GameHand): boolean {
    const isFree = FreeBetRules.isFreeSplit(hand.cards);

    if (!isFree) {
      if (player.chips < hand.bet) return false;
      player.chips -= hand.bet;
    }

    const card1 = hand.cards[0];
    const card2 = hand.cards[1];

    // Create two new hands
    const newCard1 = this.state.deck.draw(true);
    const newCard2 = this.state.deck.draw(true);

    // Original hand retains the player's real stake. On a free split the
    // casino covers the NEW hand only — it is a phantom hand (hasRealStake=false)
    // and the original is still a normal stake hand.
    hand.cards = [card1, newCard1];

    const newHand: GameHand = {
      id: uuid(),
      cards: [card2, newCard2],
      bet: hand.bet,
      freeBet: false,
      hasRealStake: !isFree,
      status: 'ACTIVE',
      payout: 0,
      splitFrom: hand.id,
    };

    player.hands.splice(this.state.currentHandIndex + 1, 0, newHand);

    // Check for 21 on either hand
    const val1 = HandEvaluator.evaluate(hand.cards);
    if (val1.best === 21) hand.status = 'STOOD';

    const val2 = HandEvaluator.evaluate(newHand.cards);
    if (val2.best === 21) newHand.status = 'STOOD';

    this.eventQueue.push({
      type: 'HAND_SPLIT',
      seatIndex: player.seatIndex,
      hands: player.hands,
    });

    // If current hand auto-stood (21), advance
    if (hand.status !== 'ACTIVE') {
      this.advanceTurn();
    } else {
      this.emitTurnStart();
    }

    return true;
  }

  private handleSurrender(player: EnginePlayer, hand: GameHand): boolean {
    hand.status = 'SURRENDERED';
    // Normal hand: give back half the stake. Phantom (free-split) hand has no
    // real stake, so surrender returns nothing.
    hand.payout = hand.hasRealStake ? Math.floor(hand.bet / 2) : 0;

    this.eventQueue.push({
      type: 'HAND_SURRENDERED',
      seatIndex: player.seatIndex,
      handIndex: this.state.currentHandIndex,
    });

    this.advanceTurn();
    return true;
  }

  private advanceTurn(): void {
    const player = this.state.players.get(this.state.currentSeatIndex)!;

    // Check next hand for same player (splits)
    for (let i = this.state.currentHandIndex + 1; i < player.hands.length; i++) {
      if (player.hands[i].status === 'ACTIVE') {
        this.state.currentHandIndex = i;
        this.emitTurnStart();
        return;
      }
    }

    // Move to next player
    const seatOrder = [...this.state.players.keys()].sort();
    const currentIdx = seatOrder.indexOf(this.state.currentSeatIndex);

    for (let i = currentIdx + 1; i < seatOrder.length; i++) {
      const nextPlayer = this.state.players.get(seatOrder[i])!;
      for (let j = 0; j < nextPlayer.hands.length; j++) {
        if (nextPlayer.hands[j].status === 'ACTIVE') {
          this.state.currentSeatIndex = seatOrder[i];
          this.state.currentHandIndex = j;
          this.emitTurnStart();
          return;
        }
      }
    }

    // All players done
    this.startDealerTurn();
  }

  // --- DEALER TURN ---

  private startDealerTurn(): void {
    this.state.status = 'DEALER_TURN';

    // Check if any non-busted/surrendered hands exist
    let hasActiveHands = false;
    for (const player of this.state.players.values()) {
      for (const hand of player.hands) {
        if (hand.status === 'STOOD' || hand.status === 'BLACKJACK') {
          hasActiveHands = true;
          break;
        }
      }
    }

    // Reveal hole card
    this.state.dealerHand[1] = { ...this.state.dealerHand[1], faceUp: true };
    let dealerValue = HandEvaluator.evaluate(this.state.dealerHand);

    this.eventQueue.push({
      type: 'DEALER_REVEAL',
      card: this.state.dealerHand[1],
      value: dealerValue,
    });

    if (hasActiveHands) {
      // Dealer hits on soft 17
      while (dealerValue.best < 17 || (dealerValue.best === 17 && dealerValue.isSoft)) {
        const card = this.state.deck.draw(true);
        this.state.dealerHand.push(card);
        dealerValue = HandEvaluator.evaluate(this.state.dealerHand);

        this.eventQueue.push({
          type: 'DEALER_DRAW',
          card,
          value: dealerValue,
        });
      }
    }

    this.state.dealerValue = dealerValue;
    this.resolveRound();
  }

  // --- RESOLUTION ---

  private resolveRound(): void {
    this.state.status = 'RESOLVING';
    const dealerValue = this.state.dealerValue!;
    const dealerBusted = dealerValue.isBusted;
    const playerResults = new Map<number, { chipChange: number; newTotal: number }>();

    for (const player of this.state.players.values()) {
      let totalPayout = 0;
      let totalBet = 0;

      for (let i = 0; i < player.hands.length; i++) {
        const hand = player.hands[i];
        totalBet += hand.freeBet ? 0 : hand.bet;

        if (hand.status === 'SURRENDERED') {
          hand.result = 'LOSS';
          // Already calculated payout (half bet back)
          totalPayout += hand.payout;
          this.eventQueue.push({
            type: 'HAND_RESULT',
            seatIndex: player.seatIndex,
            handIndex: i,
            result: 'LOSS',
            payout: hand.payout,
          });
          continue;
        }

        const handValue = HandEvaluator.evaluate(hand.cards);
        const { result, payout } = FreeBetRules.calculatePayout(
          handValue.best,
          dealerValue.best,
          hand.bet,
          hand.status === 'BLACKJACK',
          hand.status === 'BUSTED',
          dealerBusted,
          hand.freeBet,
          hand.hasRealStake
        );

        hand.result = result;
        hand.payout = payout;
        totalPayout += payout;

        this.eventQueue.push({
          type: 'HAND_RESULT',
          seatIndex: player.seatIndex,
          handIndex: i,
          result,
          payout,
        });
      }

      // Calculate chip change: payout minus what the player actually wagered
      // player.bet = original stake placed during betting
      // For splits/doubles, the player may have wagered more (paid splits/doubles)
      // But free bets don't cost the player anything extra
      const chipChange = totalPayout - player.bet;
      player.chips += chipChange;
      playerResults.set(player.seatIndex, { chipChange, newTotal: player.chips });
    }

    this.state.status = 'COMPLETE';

    this.eventQueue.push({
      type: 'ROUND_COMPLETE',
      playerResults,
    });
  }
}
