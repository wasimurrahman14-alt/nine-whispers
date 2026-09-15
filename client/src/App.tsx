import { useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useStore } from './state/store';
import { rejoin } from './state/actions';
import { loadSession } from './state/session';
import JoinScreen from './screens/JoinScreen';
import HomeScreen from './screens/HomeScreen';
import CharacterSelectScreen from './screens/CharacterSelectScreen';
import RoleRevealScreen from './screens/RoleRevealScreen';
import BoardScreen from './screens/BoardScreen';
import EndScreen from './screens/EndScreen';

function GameRoom() {
  const { code } = useParams();
  const room = useStore((s) => s.room);
  const [checkingRejoin, setCheckingRejoin] = useState(true);

  useEffect(() => {
    if (room || !code) {
      setCheckingRejoin(false);
      return;
    }
    const saved = loadSession();
    if (saved && saved.code === code.toUpperCase()) {
      setCheckingRejoin(true);
      rejoin(saved.code, saved.sessionToken).finally(() => setCheckingRejoin(false));
    } else {
      setCheckingRejoin(false);
    }
  }, [code, room]);

  if (checkingRejoin) return null;

  if (!room || room.code !== code?.toUpperCase()) {
    return <JoinScreen codeFromUrl={code ?? null} />;
  }

  switch (room.match.phase) {
    case 'lobby':
      return <HomeScreen />;
    case 'characterSelect':
      return <CharacterSelectScreen />;
    case 'roleReveal':
      return <RoleRevealScreen />;
    case 'board':
    case 'turnResult':
      return <BoardScreen />;
    case 'end':
      return <EndScreen />;
    default:
      return null;
  }
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<JoinScreen codeFromUrl={null} />} />
        <Route path="/room/:code" element={<GameRoom />} />
      </Routes>
    </div>
  );
}
