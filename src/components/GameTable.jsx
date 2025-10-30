import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Timer, Coins } from 'lucide-react';

// Suits and ranks
const SUITS = ['H', 'D', 'C', 'S'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function buildDeck() {
  const deck = [];
  for (const s of SUITS) for (const r of RANKS) deck.push(r + s);
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function pretty(card) {
  const r = card.slice(0, -1);
  const s = card.slice(-1);
  const suit = { H: '♥', D: '♦', C: '♣', S: '♠' }[s];
  const color = s === 'H' || s === 'D' ? '#E86F45' : '#222222';
  return { rank: r, suit, color };
}

function Card({ card, onClick, draggable }) {
  const p = pretty(card);
  return (
    <motion.button
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(card)}
      className={`relative h-28 w-20 rounded-xl bg-[#F8F4F0] shadow-md border-2 border-[#7A3E2D]/40 flex flex-col items-center justify-between p-2 ${draggable ? 'cursor-pointer' : ''}`}
      style={{ backgroundImage: 'linear-gradient(180deg,#FFFFFF,#F1EAE4)' }}
    >
      <span className="self-start text-sm" style={{ color: p.color }}>{p.rank}</span>
      <span className="text-2xl" style={{ color: p.color }}>{p.suit}</span>
      <span className="self-end text-sm" style={{ color: p.color }}>{p.rank}</span>
    </motion.button>
  );
}

function PlayerSeat({ name, coins, active, position }) {
  const pos = {
    0: 'left-1/2 -translate-x-1/2 -top-2',
    1: 'right-4 top-10',
    2: 'right-8 top-1/2 -translate-y-1/2',
    3: 'right-12 bottom-10',
    4: 'left-1/2 -translate-x-1/2 -bottom-2',
    5: 'left-12 bottom-10',
    6: 'left-8 top-1/2 -translate-y-1/2',
    7: 'left-4 top-10'
  }[position];

  return (
    <div className={`absolute ${pos} flex flex-col items-center gap-1`}>
      <div className={`relative rounded-full p-[2px] ${active ? 'bg-gradient-to-r from-[#F9D976] to-[#E86F45]' : 'bg-transparent'}`}>
        <div className="h-10 w-10 rounded-full bg-[#F9D976]/20 border border-[#F9D976]/50 flex items-center justify-center">
          <User className="text-[#F9D976]" size={18} />
        </div>
      </div>
      <div className="text-xs text-[#F8F4F0] opacity-90">{name}</div>
      <div className="flex items-center gap-1 text-[10px] text-[#F8F4F0]/80">
        <Coins size={12} className="text-[#F9D976]" /> {coins}
      </div>
    </div>
  );
}

export default function GameTable({ onEnd }) {
  const [players] = useState(() => {
    const bots = Array.from({ length: 3 }).map((_, i) => ({ id: 'AI_'+(i+1), name: 'AI_'+(i+1), coins: 200 }));
    return [{ id: 'P1', name: 'You', coins: 200 }, ...bots];
  });
  const [turnIdx, setTurnIdx] = useState(0);
  const [deck, setDeck] = useState([]);
  const [discard, setDiscard] = useState([]);
  const [hands, setHands] = useState({});
  const [phase, setPhase] = useState('draw'); // 'draw' | 'discard'
  const [message, setMessage] = useState('Your move: draw a card');

  // Setup game
  useEffect(() => {
    const d = buildDeck();
    const h = {};
    const count = players.length;
    for (let i = 0; i < count; i++) {
      h[i] = d.splice(0, 7);
    }
    const first = d.pop();
    setHands(h);
    setDeck(d);
    setDiscard([first]);
  }, [players.length]);

  const isYourTurn = turnIdx === 0;

  // AI behavior
  useEffect(() => {
    if (!deck.length) return;
    if (isYourTurn) return;
    const t = setTimeout(() => {
      const aiIdx = turnIdx;
      const hand = hands[aiIdx];

      // Simple AI: decide draw source
      const topDiscard = discard[discard.length - 1];
      let drew;
      if (Math.random() < 0.5 && topDiscard) {
        drew = topDiscard;
        setDiscard(prev => prev.slice(0, -1));
      } else {
        drew = deck[deck.length - 1];
        setDeck(prev => prev.slice(0, -1));
      }

      // Discard a random non-helpful card (basic heuristic: prefer high ranks)
      const newHand = [...hand, drew];
      const candidates = newHand.sort((a,b) => RANKS.indexOf(a.slice(0,-1)) - RANKS.indexOf(b.slice(0,-1)));
      const discardCard = candidates[candidates.length - 1];

      const updated = { ...hands, [aiIdx]: newHand.filter(c => c !== discardCard) };
      setHands(updated);
      setDiscard(prev => [...prev, discardCard]);

      // Chance to declare show randomly after some turns
      if (Math.random() < 0.12) {
        onEnd?.('lose'); // you lose vs AI declared first
        return;
      }

      // Next turn
      setTurnIdx((aiIdx + 1) % players.length);
      setPhase('draw');
      setMessage(isYourTurn ? 'Your move: draw a card' : `Player ${players[(aiIdx+1)%players.length].name}'s turn`);
    }, 1000);
    return () => clearTimeout(t);
  }, [turnIdx, isYourTurn, hands, deck, discard, onEnd, players]);

  function draw(source) {
    if (!isYourTurn || phase !== 'draw') return;
    if (source === 'open') {
      const top = discard[discard.length - 1];
      if (!top) return;
      setDiscard(discard.slice(0, -1));
      setHands({ ...hands, 0: [...hands[0], top] });
    } else {
      const top = deck[deck.length - 1];
      if (!top) return;
      setDeck(deck.slice(0, -1));
      setHands({ ...hands, 0: [...hands[0], top] });
    }
    setPhase('discard');
    setMessage('Discard a card');
  }

  function discardCard(card) {
    if (!isYourTurn || phase !== 'discard') return;
    const newHand = hands[0].filter(c => c !== card);
    setHands({ ...hands, 0: newHand });
    setDiscard([...discard, card]);
    setPhase('draw');
    setTurnIdx(1 % players.length);
    setMessage("Opponent's turn");
  }

  function declareShow() {
    // Super simple validation: if you have 3 of a kind anywhere
    const counts = hands[0].reduce((acc, c) => {
      const r = c.slice(0,-1);
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
    const success = Object.values(counts).some(v => v >= 3);
    onEnd?.(success ? 'win' : 'lose');
  }

  const yourHand = hands[0] || [];
  const topDiscard = discard[discard.length - 1];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#C2502B] to-[#7A3E2D] text-[#F8F4F0] relative p-4">
      {/* Table */}
      <div className="mx-auto mt-4 h-[520px] max-w-5xl rounded-[48px] border-4 border-[#7A3E2D] bg-[radial-gradient(ellipse_at_center,_#7A3E2D_0%,_#5b2d22_60%,_#4a251c_100%)] relative overflow-hidden">
        {/* Seats */}
        {players.map((p, i) => (
          <PlayerSeat key={p.id} name={p.name} coins={p.coins} active={i === turnIdx} position={i} />
        ))}

        {/* Center piles */}
        <div className="absolute inset-0 flex items-center justify-center gap-6">
          {/* Closed deck */}
          <div className="relative">
            <div className="h-28 w-20 rounded-xl bg-[#F8F4F0] border-2 border-[#7A3E2D]/60 shadow-md" style={{ backgroundImage: 'linear-gradient(180deg,#FFFFFF,#F1EAE4)' }} />
            <div className="absolute -top-2 -left-2 h-28 w-20 rounded-xl bg-[#F8F4F0] border-2 border-[#7A3E2D]/60 shadow-md opacity-70" />
            <button onClick={() => draw('closed')} className="mt-2 w-full rounded-lg bg-[#F9D976] text-[#222222] text-sm font-bold py-1 border-2 border-[#7A3E2D]">Draw Closed</button>
          </div>

          {/* Discard pile */}
          <div className="flex flex-col items-center">
            {topDiscard ? <Card card={topDiscard} /> : <div className="h-28 w-20 rounded-xl border-2 border-dashed border-[#F8F4F0]/30" />}
            <button onClick={() => draw('open')} className="mt-2 w-full rounded-lg bg-[#F9D976] text-[#222222] text-sm font-bold py-1 border-2 border-[#7A3E2D]">Draw Open</button>
          </div>
        </div>

        {/* Turn banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-[#F8F4F0]/10 px-4 py-2 border border-[#F9D976]/30 text-sm">
            <Timer size={16} className="text-[#F9D976]" /> {message}
          </div>
        </div>

        {/* Your hand */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="flex items-end gap-2">
            {yourHand.map(c => (
              <Card key={c} card={c} onClick={discardCard} draggable />
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-3">
            <button onClick={declareShow} className="rounded-xl bg-[#E86F45] text-[#F8F4F0] px-4 py-2 font-bold border-2 border-[#7A3E2D]">Declare Show</button>
          </div>
        </div>
      </div>
    </div>
  );
}
