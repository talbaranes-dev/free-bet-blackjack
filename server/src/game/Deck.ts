import type { Card, Suit, Rank } from '../../../shared/types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck {
  private cards: Card[] = [];
  private dealt: number = 0;
  private numDecks: number;

  constructor(numDecks: number = 6) {
    this.numDecks = numDecks;
    this.reset();
  }

  reset() {
    this.cards = [];
    for (let d = 0; d < this.numDecks; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          this.cards.push({ suit, rank, faceUp: true });
        }
      }
    }
    this.shuffle();
    this.dealt = 0;
  }

  shuffle() {
    // Fisher-Yates shuffle
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.dealt = 0;
  }

  draw(faceUp: boolean = true): Card {
    if (this.dealt >= this.cards.length) {
      this.reset();
    }
    const card = { ...this.cards[this.dealt], faceUp };
    this.dealt++;
    return card;
  }

  needsReshuffle(): boolean {
    // Reshuffle at 75% penetration
    return this.dealt > this.cards.length * 0.75;
  }

  remaining(): number {
    return this.cards.length - this.dealt;
  }
}
