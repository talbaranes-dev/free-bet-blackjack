import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { BlackjackEngine, GameEvent } from '../game/BlackjackEngine';
import { S2C, C2S } from '../../../shared/events';
import type { GameState, PlayerAction } from '../../../shared/types';

const prisma = new PrismaClient();

interface RoomData {
  seats: (({ userId: string; username: string; chips: number; isReady: boolean; socketId: string }) | null)[];
  minBet: number;
  maxBet: number;
}

export class GameManager {
  private io: Server;
  private roomKey: string;
  private room: RoomData;
  private engine: BlackjackEngine;
  private roundNumber: number = 0;
  private turnTimeout: NodeJS.Timeout | null = null;
  private bettingTimeout: NodeJS.Timeout | null = null;

  constructor(io: Server, roomKey: string, room: RoomData) {
    this.io = io;
    this.roomKey = roomKey;
    this.room = room;
    this.engine = new BlackjackEngine();
  }

  getClientState(): GameState | null {
    const state = this.engine.getState();
    if (state.status === 'BETTING' || state.status === 'COMPLETE') return null;

    return {
      id: state.id,
      status: state.status,
      dealerHand: state.dealerHand,
      dealerValue: state.dealerValue || undefined,
      currentSeatIndex: state.currentSeatIndex,
      currentHandIndex: state.currentHandIndex,
      timeRemaining: 20,
      roundNumber: state.roundNumber,
    };
  }

  startBetting() {
    this.roundNumber++;
    this.engine = new BlackjackEngine(this.roundNumber);

    this.io.to(`room:${this.roomKey}`).emit(S2C.BETTING_OPEN, {
      minBet: this.room.minBet,
      maxBet: this.room.maxBet,
      timeRemaining: 15,
    });

    // Auto-deal after 15 seconds
    this.bettingTimeout = setTimeout(() => {
      this.deal();
    }, 15000);
  }

  placeBet(userId: string, amount: number): boolean {
    const seatIdx = this.room.seats.findIndex((s) => s?.userId === userId);
    if (seatIdx < 0) return false;

    const seat = this.room.seats[seatIdx]!;
    if (amount < this.room.minBet || amount > this.room.maxBet || amount > seat.chips) return false;

    const success = this.engine.placeBet(seatIdx, userId, seat.username, seat.chips, amount);
    if (success) {
      this.io.to(`room:${this.roomKey}`).emit(S2C.BET_PLACED, { seatIndex: seatIdx, amount });

      // Check if all seated players have bet
      const seatedCount = this.room.seats.filter((s) => s !== null).length;
      const betCount = this.engine.getState().players.size;
      if (betCount >= seatedCount) {
        if (this.bettingTimeout) clearTimeout(this.bettingTimeout);
        this.deal();
      }
    }
    return success;
  }

  private deal() {
    if (this.bettingTimeout) {
      clearTimeout(this.bettingTimeout);
      this.bettingTimeout = null;
    }

    this.engine.deal();
    this.processEvents();
  }

  processAction(userId: string, action: PlayerAction): boolean {
    const seatIdx = this.room.seats.findIndex((s) => s?.userId === userId);
    if (seatIdx < 0) return false;

    if (this.turnTimeout) {
      clearTimeout(this.turnTimeout);
      this.turnTimeout = null;
    }

    const success = this.engine.processAction(seatIdx, action);
    if (success) {
      this.processEvents();
    }
    return success;
  }

  private processEvents() {
    const events = this.engine.flushEvents();

    for (const event of events) {
      this.broadcastEvent(event);
    }
  }

  private broadcastEvent(event: GameEvent) {
    const roomChannel = `room:${this.roomKey}`;

    switch (event.type) {
      case 'CARDS_DEALT':
        // Send card data to players (hide face-down cards info)
        const dealData: Record<number, any> = {};
        for (const [seat, player] of event.players) {
          dealData[seat] = {
            seatIndex: seat,
            hands: player.hands,
          };
        }
        this.io.to(roomChannel).emit(S2C.CARDS_DEALT, {
          players: dealData,
          dealerHand: event.dealerHand,
        });
        break;

      case 'TURN_START':
        this.io.to(roomChannel).emit(S2C.TURN_START, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
          actions: event.actions,
          timeRemaining: event.timeRemaining,
        });
        // Set auto-stand timeout
        this.turnTimeout = setTimeout(() => {
          this.engine.processAction(event.seatIndex, 'stand');
          this.processEvents();
        }, 20000);
        break;

      case 'CARD_DRAWN':
        this.io.to(roomChannel).emit(S2C.CARD_DRAWN, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
          card: event.card,
          value: event.value,
        });
        break;

      case 'HAND_DOUBLED':
        this.io.to(roomChannel).emit(S2C.HAND_DOUBLED, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
          card: event.card,
          value: event.value,
          freeBet: event.freeBet,
        });
        break;

      case 'HAND_SPLIT':
        this.io.to(roomChannel).emit(S2C.HAND_SPLIT, {
          seatIndex: event.seatIndex,
          hands: event.hands,
        });
        break;

      case 'HAND_BUSTED':
        this.io.to(roomChannel).emit(S2C.HAND_BUSTED, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
          value: event.value,
        });
        break;

      case 'HAND_STOOD':
        this.io.to(roomChannel).emit(S2C.HAND_STOOD, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
        });
        break;

      case 'HAND_SURRENDERED':
        this.io.to(roomChannel).emit(S2C.HAND_SURRENDERED, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
        });
        break;

      case 'DEALER_REVEAL':
        this.io.to(roomChannel).emit(S2C.DEALER_REVEAL, {
          card: event.card,
          value: event.value,
        });
        break;

      case 'DEALER_DRAW':
        this.io.to(roomChannel).emit(S2C.DEALER_DRAW, {
          card: event.card,
          value: event.value,
        });
        break;

      case 'HAND_RESULT':
        this.io.to(roomChannel).emit(S2C.HAND_RESULT, {
          seatIndex: event.seatIndex,
          handIndex: event.handIndex,
          result: event.result,
          payout: event.payout,
        });
        break;

      case 'ROUND_COMPLETE':
        // Update DB and emit results
        this.handleRoundComplete(event.playerResults);
        break;
    }
  }

  private async handleRoundComplete(results: Map<number, { chipChange: number; newTotal: number }>) {
    const resultData: Record<number, { chipChange: number; newTotal: number }> = {};

    for (const [seatIdx, result] of results) {
      resultData[seatIdx] = result;

      // Update user chips in DB
      const seat = this.room.seats[seatIdx];
      if (seat) {
        seat.chips = result.newTotal;
        try {
          await prisma.user.update({
            where: { id: seat.userId },
            data: {
              chips: result.newTotal,
              gamesPlayed: { increment: 1 },
              ...(result.chipChange > 0
                ? { gamesWon: { increment: 1 }, totalWinnings: { increment: result.chipChange } }
                : {}),
            },
          });
        } catch (err) {
          console.error('Failed to update user chips:', err);
        }
      }
    }

    this.io.to(`room:${this.roomKey}`).emit(S2C.ROUND_COMPLETE, resultData);

    // Reset ready state
    for (const seat of this.room.seats) {
      if (seat) seat.isReady = false;
    }

    // Auto-start next round after 5 seconds
    setTimeout(() => {
      this.startBetting();
    }, 5000);
  }
}
