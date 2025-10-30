import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    const t = setTimeout(() => onFinish && onFinish(), 2200);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-b from-[#E86F45] to-[#F9D976] text-[#F8F4F0] flex items-center justify-center">
      {/* Subtle heatwave shimmer */}
      <div className="pointer-events-none absolute inset-0" style={{
        background: 'radial-gradient(ellipse at center, rgba(249,217,118,0.15) 0%, rgba(232,111,69,0.05) 60%, rgba(194,80,43,0.05) 100%)'
      }} />

      {/* Dust particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(24)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute block h-1 w-1 rounded-full bg-[#F8F4F0]/30"
            initial={{ x: Math.random() * 1200 - 200, y: Math.random() * 800, opacity: 0 }}
            animate={{
              x: [null, (Math.random() * 1200 - 200) + 80],
              y: [null, (Math.random() * 800) - 40],
              opacity: [0, 0.8, 0]
            }}
            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, repeatType: 'mirror' }}
          />
        ))}
      </div>

      {/* Logo animation - flipping cards forming DESSERT */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="mb-6 text-sm tracking-widest uppercase text-[#7A3E2D]">A Western Card Game</div>
          <div className="flex gap-2">
            {['D','E','S','S','E','R','T'].map((ch, idx) => (
              <motion.div
                key={idx}
                initial={{ rotateX: -90, y: -30, opacity: 0 }}
                animate={{ rotateX: 0, y: 0, opacity: 1 }}
                transition={{ delay: 0.15 * idx, type: 'spring', stiffness: 160 }}
                className="h-20 w-14 rounded-xl bg-[#F8F4F0] text-[#222222] shadow-lg shadow-[#7A3E2D]/30 flex items-center justify-center font-extrabold text-3xl"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #FFFFFF, #F1EAE4)',
                }}
              >
                {ch}
              </motion.div>
            ))}
          </div>
          <div className="mt-6 text-[#F8F4F0]/90">Dealing the deck...</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
