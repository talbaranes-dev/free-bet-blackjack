import type { Card, AvailableActions } from '../../shared/types';
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
        isFreeDouble: false,
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
      isFreeDouble: freeDouble,
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
   *
   * Accounting model: `payout` is the total chips to credit this hand at resolution.
   * The engine then computes `chipChange = totalPayout - player.bet` — `player.bet`
   * represents the original placed stake that was never deducted from chips, so it
   * must be returned-or-lost at settlement.
   *
   * - `hasRealStake=true`  : this hand holds player money (normal hand, or free
   *                         double where the original stake is still in play).
   * - `hasRealStake=false` : phantom hand created by a free split — casino owns it,
   *                         no stake to return, only winnings flow to the player.
   * - `freeBet=true` on a hand with `hasRealStake=true` means the casino matched
   *   the doubled portion: on win, return stake + 2x winnings (bet * 3).
   */
  static calculatePayout(
    handBest: number,
    dealerBest: number,
    bet: number,
    isBlackjack: boolean,
    isBusted: boolean,
    dealerBusted: boolean,
    isFreeBet: boolean,
    hasRealStake: boolean = true
  ): { result: 'WIN' | 'LOSS' | 'PUSH' | 'BLACKJACK_WIN'; payout: number } {
    const winAmount = () => {
      if (!hasRealStake) return bet; // phantom hand: only winnings flow
      return isFreeBet ? bet * 3 : bet * 2; // real stake: stake + winnings (bet*3 if casino matched)
    };
    const pushAmount = hasRealStake ? bet : 0;

    // Player busted
    if (isBusted) {
      return { result: 'LOSS', payout: 0 };
    }

    // Dealer busts with 22 (Free Bet special rule)
    if (dealerBusted && this.isDealerTwentyTwo(dealerBest)) {
      if (isBlackjack) {
        return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
      }
      return { result: 'PUSH', payout: pushAmount };
    }

    // Dealer busts with 23+
    if (dealerBusted) {
      if (isBlackjack) {
        return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
      }
      return { result: 'WIN', payout: winAmount() };
    }

    // Player blackjack vs dealer non-blackjack
    if (isBlackjack && dealerBest !== 21) {
      return { result: 'BLACKJACK_WIN', payout: Math.floor(bet * 2.5) };
    }

    // Both blackjack
    if (isBlackjack && dealerBest === 21) {
      return { result: 'PUSH', payout: pushAmount };
    }

    // Compare values
    if (handBest > dealerBest) {
      return { result: 'WIN', payout: winAmount() };
    }

    if (handBest === dealerBest) {
      return { result: 'PUSH', payout: pushAmount };
    }

    return { result: 'LOSS', payout: 0 };
  }
}
