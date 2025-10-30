import { User, Coins, Trophy, ShoppingBag, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Lobby({ player, onStart }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E86F45] via-[#C2502B] to-[#7A3E2D] text-[#F8F4F0] p-6">
      <div className="mx-auto max-w-5xl">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#F9D976]/20 border border-[#F9D976]/50 flex items-center justify-center">
              <User className="text-[#F9D976]" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-wide">{player.name}</div>
              <div className="text-sm text-[#F8F4F0]/80">Cowpoke ID: {player.id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#7A3E2D]/50 px-4 py-2 border border-[#F9D976]/30">
            <Coins className="text-[#F9D976]" size={18} />
            <span className="font-bold">{player.coins.toLocaleString()}</span>
          </div>
        </div>

        {/* Center actions */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart?.('join')}
            className="col-span-2 rounded-2xl bg-[#F9D976] text-[#222222] p-8 shadow-xl shadow-[#7A3E2D]/30 border-2 border-[#7A3E2D] flex items-center justify-between"
          >
            <div>
              <div className="text-2xl font-extrabold">Join Table</div>
              <div className="text-sm text-[#7A3E2D]">Find a quick match with 2–8 players</div>
            </div>
            <Play />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart?.('create')}
            className="rounded-2xl bg-[#F8F4F0] text-[#222222] p-8 shadow-xl shadow-[#7A3E2D]/30 border-2 border-[#7A3E2D]/70"
          >
            <div className="text-lg font-extrabold">Create Game</div>
            <div className="text-sm text-[#7A3E2D]">Invite friends, set rules</div>
          </motion.button>
        </div>

        {/* Secondary actions */}
        <div className="mt-10 flex items-center gap-4">
          <button className="flex items-center gap-2 rounded-xl bg-[#7A3E2D]/60 px-4 py-2 border border-[#F9D976]/30">
            <Trophy size={18} className="text-[#F9D976]" />
            <span>Leaderboard</span>
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[#7A3E2D]/60 px-4 py-2 border border-[#F9D976]/30">
            <ShoppingBag size={18} className="text-[#F9D976]" />
            <span>Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
