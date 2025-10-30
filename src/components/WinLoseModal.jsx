import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

export default function WinLoseModal({ open, result, onPlayAgain, onExit }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 160 }}
            className="w-full max-w-md rounded-3xl bg-[#F8F4F0] text-[#222222] p-8 relative overflow-hidden"
          >
            {/* Confetti / coin burst */}
            <div className="pointer-events-none absolute inset-0">
              {[...Array(18)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{ width: 6, height: 6, background: i % 2 ? '#E86F45' : '#F9D976' }}
                  initial={{ x: 180, y: 100, opacity: 0 }}
                  animate={{ x: 180 + Math.cos(i) * 120, y: 100 + Math.sin(i) * 60, opacity: 0.9 }}
                  transition={{ delay: 0.05 * i, duration: 0.6 }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Coins className={result === 'win' ? 'text-yellow-500' : 'text-[#7A3E2D]'} />
              <div className="text-2xl font-extrabold">
                {result === 'win' ? 'You Win!' : result === 'lose' ? 'Tough Luck!' : 'Round Over'}
              </div>
            </div>
            <div className="mt-2 text-[#7A3E2D]">Coins {result === 'win' ? '+150' : result === 'lose' ? '-50' : '+0'}</div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={onPlayAgain} className="rounded-xl bg-[#F9D976] text-[#222222] py-3 font-bold border-2 border-[#7A3E2D]">Play Again</button>
              <button onClick={onExit} className="rounded-xl bg-[#E86F45] text-[#F8F4F0] py-3 font-bold border-2 border-[#7A3E2D]">Return to Lobby</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
