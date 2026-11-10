import { ChipStack } from '@/components/poker/ChipStack';
import { PlayingCard } from '@/components/poker/PlayingCard';
import { SeatView } from '@/components/poker/SeatView';
import { formatChips } from '@/lib/format';
import { potTotal } from '@/poker/engine';
import type { HandState, Seat, TableState } from '@/poker/types';

const SEAT_POSITIONS = [
  { x: 50, y: 88 },
  { x: 12, y: 70 },
  { x: 12, y: 26 },
  { x: 50, y: 10 },
  { x: 88, y: 26 },
  { x: 88, y: 70 },
];

const BET_RATIO = 0.36;
const DEALER_IMAGE = 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=160&h=160&fit=crop&crop=face';

function statusFor(seat: Seat, hand: HandState | null): string | null {
  if (seat.sittingOut) return null;
  if (!hand || hand.street === 'complete') return null;
  if (seat.folded) return 'Folded';
  if (seat.allIn) return 'All-in';
  return null;
}

interface PokerTableProps {
  table: TableState;
  meIndex: number;
  dealerName: string;
  streetLabel: string;
}

export function PokerTable({ table, meIndex, dealerName, streetLabel }: PokerTableProps) {
  const hand = table.hand;
  const pot = potTotal(table);
  const finished = hand?.street === 'complete';
  const revealCards = !!hand?.showdown && finished;
  const isDealing = hand?.street === 'preflop' && hand.board.length === 0 && !!hand.toAct;
  const winnerSeats = new Set(hand?.winners.map((award) => award.seat) ?? []);

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-4xl sm:aspect-[16/10]">
      <div className="absolute inset-0 rounded-[50%] bg-gradient-to-b from-amber-800 to-amber-950 shadow-[0_40px_90px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,220,150,0.25)]" />
      <div className="absolute inset-[12px] rounded-[50%] border border-gold-400/40 bg-[radial-gradient(ellipse_at_50%_35%,#22906f_0%,#147055_50%,#0a3328_100%)] shadow-[inset_0_0_60px_rgba(0,0,0,0.55)]" />
      <div className="absolute inset-[30px] rounded-[50%] border border-white/10" />
      <div className="absolute inset-[30px] rounded-[50%] bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.12),transparent_55%)]" />

      <div className="absolute left-1/2 top-[13%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <div
          className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-gold-400/60 bg-slate-900 shadow-xl transition-transform duration-500 sm:h-18 sm:w-18 ${isDealing ? 'scale-110 animate-pulse' : ''}`}
        >
          <img src={DEALER_IMAGE} alt={`Dealer ${dealerName}`} className="h-full w-full object-cover" />
        </div>
        <span className="mt-1 whitespace-nowrap rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-gold-300">
          Dealer {dealerName}
        </span>
      </div>

      <div className="absolute left-1/2 top-[46%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <span className="rounded-full bg-black/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
          {hand && !finished ? streetLabel : hand ? 'Showdown' : 'Waiting for players'}
        </span>
        <div className="flex gap-1.5 sm:gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const card = hand?.board[index];
            return card ? (
              <PlayingCard key={`${hand?.number}-${index}-${card.rank}${card.suit}`} card={card} size="sm" delayMs={index * 120} />
            ) : (
              <div key={`slot-${index}`} className="h-[52px] w-9 rounded-md border border-dashed border-white/20 bg-black/10 sm:h-[64px] sm:w-11" />
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="rounded-full border border-gold-400/30 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold-300 shadow-lg">
            Pot {formatChips(pot)}
          </span>
          {finished && hand && hand.rake > 0 && (
            <span className="text-[10px] uppercase tracking-wider text-emerald-100/70">House rake {formatChips(hand.rake)}</span>
          )}
        </div>
      </div>

      {table.seats.map((seat, index) => {
        if (!seat || !hand || finished || seat.bet <= 0) return null;
        const position = SEAT_POSITIONS[index];
        const x = position.x + (50 - position.x) * BET_RATIO;
        const y = position.y + (50 - position.y) * BET_RATIO;
        return (
          <div
            key={`bet-${hand.number}-${hand.street}-${index}-${seat.bet}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <ChipStack amount={seat.bet} />
          </div>
        );
      })}

      {table.seats.map((seat, index) => {
        if (!seat) return null;
        const position = SEAT_POSITIONS[index];
        return (
          <div
            key={`${seat.id}-${index}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-seat-in"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          >
            <SeatView
              seat={seat}
              isDealer={table.dealer === index}
              isTurn={hand?.toAct === index}
              isWinner={winnerSeats.has(index)}
              revealCards={revealCards && !seat.folded}
              statusLabel={statusFor(seat, hand)}
              isYou={index === meIndex}
            />
          </div>
        );
      })}
    </div>
  );
}
