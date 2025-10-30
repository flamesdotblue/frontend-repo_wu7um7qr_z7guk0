import { useMemo, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import Lobby from './components/Lobby';
import GameTable from './components/GameTable';
import WinLoseModal from './components/WinLoseModal';

export default function App() {
  const [screen, setScreen] = useState('splash'); // splash | lobby | game
  const [player, setPlayer] = useState(() => ({ id: 'P1', name: 'Varun', coins: 500 }));
  const [modal, setModal] = useState({ open: false, result: null });

  function handleStart() {
    setScreen('game');
  }

  function handleEnd(result) {
    setModal({ open: true, result });
    setPlayer(p => ({ ...p, coins: p.coins + (result === 'win' ? 150 : result === 'lose' ? -50 : 0) }));
  }

  function playAgain() {
    setModal({ open: false, result: null });
    setScreen('game');
  }

  function returnToLobby() {
    setModal({ open: false, result: null });
    setScreen('lobby');
  }

  return (
    <div className="font-['Nunito',_Inter,_system-ui]">
      {screen === 'splash' && (
        <SplashScreen onFinish={() => setScreen('lobby')} />
      )}

      {screen === 'lobby' && (
        <Lobby player={player} onStart={handleStart} />
      )}

      {screen === 'game' && (
        <>
          <GameTable onEnd={handleEnd} />
          <WinLoseModal open={modal.open} result={modal.result} onPlayAgain={playAgain} onExit={returnToLobby} />
        </>
      )}
    </div>
  );
}
