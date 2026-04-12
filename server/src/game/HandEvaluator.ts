import type { Card, HandValue } from '../../shared/types';

export class HandEvaluator {
  static cardValue(rank: string): number {
    if (rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(rank)) return 10;
    return parseInt(rank);
  }

  static evaluate(cards: Card[]): HandValue {
    let total = 0;
    let aces = 0;

    for (const card of cards) {
      if (!card.faceUp) continue;
      const val = this.cardValue(card.rank);
      total += val;
      if (card.rank === 'A') aces++;
    }

    // Convert aces from 11 to 1 as needed
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    const hardTotal = cards.reduce((sum, c) => {
      if (!c.faceUp) return sum;
      return sum + (c.rank === 'A' ? 1 : this.cardValue(c.rank));
    }, 0);

    const softTotal = total;
    const isSoft = softTotal !== hardTotal && softTotal <= 21;
    const isBlackjack = cards.length === 2 && softTotal === 21 && cards.every((c) => c.faceUp);
    const isBusted = total > 21;

    return {
      hard: hardTotal,
      soft: softTotal,
      best: total,
      isSoft,
      isBlackjack,
      isBusted,
    };
  }

  static isTenValue(card: Card): boolean {
    return ['10', 'J', 'Q', 'K'].includes(card.rank);
  }

  static isPair(cards: Card[]): boolean {
    if (cards.length !== 2) return false;
    return cards[0].rank === cards[1].rank;
  }

  static isTenValuePair(cards: Card[]): boolean {
    return this.isPair(cards) && this.isTenValue(cards[0]);
  }

  static hardTotal(cards: Card[]): number {
    return cards.reduce((sum, c) => {
      if (!c.faceUp) return sum;
      return sum + (c.rank === 'A' ? 1 : this.cardValue(c.rank));
    }, 0);
  }
}
