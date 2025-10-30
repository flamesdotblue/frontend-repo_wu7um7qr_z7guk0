import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Timer, Coins, Hand, Sparkles } from 'lucide-react';

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

function split(card) {
  return { rank: card.slice(0, -1), suit: card.slice(-1) };
}

function pretty(card) {
  const { rank, suit } = split(card);
  const suitChar = { H: '♥', D: '♦', C: '♣', S: '♠' }[suit];
  const color = suit === 'H' || suit === 'D' ? '#E86F45' : '#222222';
  return { rank, suit: suitChar, color };
}

function Card({ card, onClick, selected, size = 'md' }) {
  const p = pretty(card);
  const sizes = {
    md: { h: 'h-28', w: 'w-20', text: 'text-2xl' },
    sm: { h: 'h-24', w: 'w-16', text: 'text-xl' },
  }[size];
  return (
    <motion.button
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(card)}
      className={`relative ${sizes.h} ${sizes.w} rounded-xl bg-[#F8F4F0] shadow-md border-2 flex flex-col items-center justify-between p-2 ${selected ? 'border-[#E86F45] ring-2 ring-[#F9D976]' : 'border-[#7A3E2D]/40'} cursor-pointer`}
      style={{ backgroundImage: 'linear-gradient(180deg,#FFFFFF,#F1EAE4)' }}
    >
      <span className="self-start text-sm" style={{ color: p.color }}>{p.rank}</span>
      <span className={`${sizes.text}`} style={{ color: p.color }}>{p.suit}</span>
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
    <div className={`absolute ${pos} hidden sm:flex flex-col items-center gap-1`}>
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
  const [phase, setPhase] = useState('play'); // 'play' | 'draw'
  const [message, setMessage] = useState('Select 1+ of the same rank and Play');
  const [selected, setSelected] = useState([]); // your selected cards
  const [hasPlayedOnce, setHasPlayedOnce] = useState({});
  const [lastPlay, setLastPlay] = useState(null); // {player, count, rank}

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
    setPhase(0 === 0 ? 'play' : 'wait');
    setMessage('Select 1+ of the same rank and Play');
    setSelected([]);
    setHasPlayedOnce({});
    setLastPlay(null);
    setTurnIdx(0);
  }, [players.length]);

  const isYourTurn = turnIdx === 0;
  const yourHand = hands[0] || [];
  const topDiscard = discard[discard.length - 1];
  const allPlayedAtLeastOnce = players.every((_, i) => !!hasPlayedOnce[i]);

  function toggleSelect(card) {
    if (!isYourTurn || phase !== 'play') return;
    const r = split(card).rank;
    if (selected.length === 0) {
      setSelected([card]);
      return;
    }
    const selRank = split(selected[0]).rank;
    if (r !== selRank) {
      // enforce same rank only
      setSelected([card]);
      return;
    }
    if (selected.includes(card)) {
      setSelected(selected.filter(c => c !== card));
    } else {
      setSelected([...selected, card]);
    }
  }

  function playSelected() {
    if (!isYourTurn || phase !== 'play') return;
    if (selected.length < 1) return;
    // remove from hand, push to discard as a set
    const newHand = yourHand.filter(c => !selected.includes(c));
    setHands({ ...hands, 0: newHand });
    setDiscard(prev => [...prev, ...selected]);
    const rank = split(selected[0]).rank;
    setLastPlay({ player: 0, count: selected.length, rank });
    setSelected([]);
    setPhase('draw');
    setMessage('Draw from Open or Closed');
  }

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
    // mark that you completed first turn
    setHasPlayedOnce(prev => ({ ...prev, 0: true }));
    // end turn
    const next = (turnIdx + 1) % players.length;
    setTurnIdx(next);
    setPhase('play');
    setMessage(next === 0 ? 'Select 1+ of the same rank and Play' : `${players[next].name}'s turn`);
  }

  function declareShow() {
    if (!allPlayedAtLeastOnce) return;
    // Simple validation: at least one 3-of-a-kind in hand
    const counts = yourHand.reduce((acc, c) => {
      const r = split(c).rank;
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
    const success = Object.values(counts).some(v => v >= 3);
    onEnd?.(success ? 'win' : 'lose');
  }

  // AI behavior: each AI plays 1+ of a single rank, then draws 1, then ends turn
  useEffect(() => {
    if (!deck.length) return;
    if (isYourTurn) return;
    const aiIdx = turnIdx;
    const hand = hands[aiIdx] || [];
    if (!hand.length) return;

    const t = setTimeout(() => {
      // choose a rank with max count
      const byRank = hand.reduce((m, c) => {
        const r = split(c).rank;
        (m[r] ||= []).push(c);
        return m;
      }, {});
      const ranks = Object.keys(byRank);
      ranks.sort((a, b) => byRank[b].length - byRank[a].length || RANKS.indexOf(b) - RANKS.indexOf(a));
      const chosen = byRank[ranks[0]];
      const playCount = Math.min(chosen.length, Math.random() < 0.5 ? 1 : chosen.length); // sometimes single, sometimes full set
      const toPlay = chosen.slice(0, playCount);

      // remove from hand and add to discard
      const newHand = hand.filter(c => !toPlay.includes(c));
      const rank = split(toPlay[0]).rank;
      setHands(prev => ({ ...prev, [aiIdx]: newHand }));
      setDiscard(prev => [...prev, ...toPlay]);
      setLastPlay({ player: aiIdx, count: toPlay.length, rank });

      // draw step
      setTimeout(() => {
        const top = discard[discard.length - 1];
        let drawFromOpen = false;
        if (top) {
          const topRank = split(top).rank;
          // small heuristic: if we already have one of that rank, take it
          drawFromOpen = newHand.some(c => split(c).rank === topRank) && Math.random() < 0.85;
        }
        if (drawFromOpen && top) {
          setDiscard(prev => prev.slice(0, -1));
          setHands(prev => ({ ...prev, [aiIdx]: [...(prev[aiIdx] || []), top] }));
        } else {
          const closed = deck[deck.length - 1];
          if (closed) {
            setDeck(prev => prev.slice(0, -1));
            setHands(prev => ({ ...prev, [aiIdx]: [...(prev[aiIdx] || []), closed] }));
          }
        }
        setHasPlayedOnce(prev => ({ ...prev, [aiIdx]: true }));
        const next = (aiIdx + 1) % players.length;
        setTurnIdx(next);
        setPhase('play');
        setMessage(next === 0 ? 'Select 1+ of the same rank and Play' : `${players[next].name}'s turn`);
      }, 500);
    }, 700);

    return () => clearTimeout(t);
  }, [turnIdx, isYourTurn, hands, deck, discard, players]);

  // Mobile friendliness: reduce card size on small screens
  const cardSize = typeof window !== 'undefined' && window.innerWidth < 400 ? 'sm' : 'md';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#C2502B] to-[#7A3E2D] text-[#F8F4F0] relative p-3 sm:p-4">
      {/* Table */}
      <div className="mx-auto mt-2 sm:mt-4 h-[78vh] max-w-5xl rounded-[36px] sm:rounded-[48px] border-4 border-[#7A3E2D] bg-[radial-gradient(ellipse_at_center,_#7A3E2D_0%,_#5b2d22_60%,_#4a251c_100%)] relative overflow-hidden">
        {/* Decorative sand sparkle */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          {[...Array(18)].map((_, i) => (
            <motion.span key={i} className="absolute h-1 w-1 rounded-full bg-[#F9D976]"
              initial={{ x: Math.random()*600, y: Math.random()*400, opacity: 0 }}
              animate={{ y: [null, Math.random()*400], opacity: [0, 0.8, 0] }}
              transition={{ duration: 3 + Math.random()*2, repeat: Infinity, repeatType: 'mirror' }} />
          ))}
        </div>

        {/* Seats (hidden on mobile to reduce clutter) */}
        {players.map((p, i) => (
          <PlayerSeat key={p.id} name={p.name} coins={p.coins} active={i === turnIdx} position={i} />
        ))}

        {/* Center piles and play controls */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-6">
          {/* Last play banner */}
          {lastPlay && (
            <div className="mb-1 sm:mb-2 rounded-full bg-[#F8F4F0]/10 px-3 py-1 border border-[#F9D976]/30 text-xs sm:text-sm">
              {players[lastPlay.player].name} played {lastPlay.count} × {lastPlay.rank}
            </div>
          )}

          <div className="flex items-start sm:items-center justify-center gap-4 sm:gap-6">
            {/* Closed deck */}
            <div className="relative flex flex-col items-center">
              <div className="h-24 w-16 sm:h-28 sm:w-20 rounded-xl bg-[#F8F4F0] border-2 border-[#7A3E2D]/60 shadow-md" style={{ backgroundImage: 'linear-gradient(180deg,#FFFFFF,#F1EAE4)' }} />
              <div className="absolute -top-2 -left-2 h-24 w-16 sm:h-28 sm:w-20 rounded-xl bg-[#F8F4F0] border-2 border-[#7A3E2D]/60 shadow-md opacity-70" />
              <button onClick={() => draw('closed')} disabled={!isYourTurn || phase !== 'draw'} className="mt-2 w-full rounded-lg bg-[#F9D976] text-[#222222] text-xs sm:text-sm font-bold py-1.5 border-2 border-[#7A3E2D] disabled:opacity-50">Draw Closed</button>
            </div>

            {/* Discard pile */}
            <div className="flex flex-col items-center">
              {topDiscard ? <Card card={topDiscard} size={cardSize} /> : <div className="h-24 w-16 sm:h-28 sm:w-20 rounded-xl border-2 border-dashed border-[#F8F4F0]/30" />}
              <button onClick={() => draw('open')} disabled={!isYourTurn || phase !== 'draw'} className="mt-2 w-full rounded-lg bg-[#F9D976] text-[#222222] text-xs sm:text-sm font-bold py-1.5 border-2 border-[#7A3E2D] disabled:opacity-50">Draw Open</button>
            </div>
          </div>

          {/* Turn banner */}
          <div className="mt-1 sm:mt-2">
            <div className="flex items-center gap-2 rounded-full bg-[#F8F4F0]/10 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#F9D976]/30 text-xs sm:text-sm">
              <Timer size={16} className="text-[#F9D976]" /> {message}
            </div>
          </div>
        </div>

        {/* Your hand and actions */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full px-3 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 overflow-x-auto pb-2 no-scrollbar">
              {yourHand.map(c => (
                <Card key={c} card={c} onClick={toggleSelect} selected={selected.includes(c)} size={cardSize} />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
              <button onClick={playSelected} disabled={!isYourTurn || phase !== 'play' || selected.length < 1} className="flex items-center gap-2 rounded-xl bg-[#E86F45] text-[#F8F4F0] px-4 py-2 font-bold border-2 border-[#7A3E2D] disabled:opacity-50">
                <Hand size={18} /> Play {selected.length > 0 ? `${selected.length}` : ''}
              </button>
              <button onClick={declareShow} disabled={!allPlayedAtLeastOnce} className="flex items-center gap-2 rounded-xl bg-[#F8F4F0] text-[#222222] px-4 py-2 font-bold border-2 border-[#7A3E2D] disabled:opacity-50">
                <Sparkles size={18} /> Declare Show
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
