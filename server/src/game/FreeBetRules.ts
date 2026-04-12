import type { Card, AvailableActions } from '../../../shared/types';
import { HandEvaluator } from './HandEvaluator';

export class FreeBetRules {
  /**
   * Check if a hand qualifies for a free double.
   * Free double is available on hard 9, 10, or 11.
   */
  static isFreeDouble(cards: Card[]): boolean {
    if (cards.length !== 2) return false;
    const hard = HandEvaluator.hardTotal(cards);
    return hard >= 9 && hard <= 11;
  }

  /**
   * Check if a hand qualifies for a free split.
   * Free split is available on any pair EXCEPT 10-value pairs.
   */
  static isFreeSplit(cards: Card[]): boolean {
    if (!HandEvaluator.isPair(cards)) return false;
    return !HandEvaluator.isTenValue(cards[0]);
  }

  /**
   * Determine available actions for a hand.
   */
  static getAvailableActions(
    cards: Card[],
    isFirstAction: boolean,
    playerChips: number,
    currentBet: number,
    numHands: number
  ): AvailableActions {
    const value = HandEvaluator.evaluate(cards);

    // No actions if busted or blackjack or stood
    if (value.isBusted || value.isBlackjack) {
      return {
        hit: false,
        stand: false,
        double: false,
        split: false,
        surrender: false,
        isFreeDOuble: false,
        isFreeSplit: false,
      };
    }

    const canHit = value.best < 21;
    const canStand = true;

    // Double: available on first 2 cards
    const canDouble = cards.length === 2;
    const freeDouble = canDouble && this.isFreeDouble(cards);
    // If not free, player needs enough chips to double
    const canAffordDouble = freeDouble || playerChips >= currentBet;

    // Split: available on pairs, max 4 hands
    const canSplit = HandEvaluator.isPair(cards) && numHands < 4;
    const freeSplit = canSplit && this.isFreeSplit(cards);
    const canAffordSplit = freeSplit || playerChips >= currentBet;

    // Surrender: only on first 2 cards, first action
    const canSurrender = cards.length === 2 && isFirstAction;

    return {
      hit: canHit,
      stand: canStand,
      double: canDouble && canAffordDouble,
      split: canSplit && canAffordSplit,
      surrender: canSurrender,
      isFreeDOuble: freeDouble,
      isFreeSplit: freeSplit,
    };
  }

  /**
   * Resolve dealer 22 rule.
   * If dealer busts with exactly 22:
   * - Blackjack hands WIN (3:2 payout)
   * - All other non-busted hands PUSH
   */
  static isDealerTwentyTwo(dealerValue: number): boolean {
    return dealerValue === 22;
  }

  /**
   * Calculate payout for a hand.
   */
  static calculatePayout(
    handBest: number,
    dealerBest: number,
    bet: number,
    isBlackjack: boolean,
    isBusted: boolean,
    dealerBusted: boolean,
    isFreeBet: boolean
  ): { result: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK_WIN'; payout: number } {
    // Player busted
    if (isBusted) {
      return { result: 'LOSS', payout: 0 };
    }

    // Dealer busts with 22 (Free Bet special rule)
    if (dealerBusted && this.isDealerTwentyTwo(dealerBest)) {
      if (isBlackjack) {
        return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
      }
      // All other non-busted hands push
      return { result: 'PUSH', payout: bet };
    }

    // Dealer busts with 23+
    if (dealerBusted) {
      if (isBlackjack) {
        return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
      }
      // Free bet: only win the original bet amount, not the doubled amount
      const winAmount = isFreeBet ? bet : bet * 2;
      return { result: 'WIN', payout: winAmount };
    }

    // Player blackjack vs dealer non-blackjack
    if (isBlackjack && dealerBest !== 21) {
      return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
    }

    // Both blackjack
    if (isBlackjack && dealerBest === 21) {
      return { result: 'PUSH', payout: bet };
    }

    // Compare values
    if (handBest > dealerBest) {
      const winAmount = isFreeBet ? bet : bet * 2;
      return { result: 'WIN', payout: winAmount };
    }

    if (handBest === dealerBest) {
      return { result: 'PUSH', payout: bet };
    }

    return { result: 'LOSS', payout: 0 };
  }
}
