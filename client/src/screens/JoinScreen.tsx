import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom, joinRoom } from '../state/actions';
import { useStore } from '../state/store';
import logo from '../assets/logo.png';

interface JoinScreenProps {
  codeFromUrl: string | null;
}

type Mode = 'choose' | 'create' | 'join';

export default function JoinScreen({ codeFromUrl }: JoinScreenProps) {
  const navigate = useNavigate();
  const error = useStore((s) => s.error);
  const setError = useStore((s) => s.setError);
  const [mode, setMode] = useState<Mode>(codeFromUrl ? 'join' : 'choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState(codeFromUrl ?? '');
  const [busy, setBusy] = useState(false);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  async function handleCreate() {
    if (!name.trim()) return setError('Enter your name first.');
    if (!/^[A-Za-z]{4}$/.test(code.trim())) return setError('Room code must be exactly 4 letters.');
    setBusy(true);
    const res = await createRoom(name.trim(), code.trim());
    setBusy(false);
    if (res.ok) navigate(`/room/${res.code}`);
    else setError(res.error);
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Enter your name first.');
    const targetCode = code.trim().toUpperCase();
    if (!/^[A-Za-z]{4}$/.test(targetCode)) return setError('Room code must be exactly 4 letters.');
    setBusy(true);
    const res = await joinRoom(targetCode, name.trim());
    setBusy(false);
    if (res.ok) navigate(`/room/${targetCode}`);
    else setError(res.error);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-6 px-6 text-center">
      <img src={logo} alt="Nine Whispers" className="w-full max-w-xs" />

      {mode === 'choose' && (
        <div className="flex w-full flex-col gap-3">
          <button
            onClick={() => setMode('create')}
            className="w-full rounded-lg bg-accent px-4 py-3 text-lg font-semibold text-bg hover:bg-accent-hover"
          >
            Create Room
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-lg font-semibold hover:bg-surface-hover"
          >
            Join Room
          </button>
        </div>
      )}

      {mode !== 'choose' && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface font-display text-3xl font-bold ring-2 ring-accent">
            {initial}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg outline-none focus:border-accent"
          />

          {mode === 'create' ? (
            <>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="Choose a 4-letter room code"
                maxLength={4}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg uppercase tracking-widest outline-none focus:border-accent"
              />
              <button
                disabled={busy}
                onClick={handleCreate}
                className="w-full rounded-lg bg-accent px-4 py-3 text-lg font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
              >
                Enter
              </button>
            </>
          ) : (
            <>
              {codeFromUrl ? (
                <p className="text-ink-muted">
                  Joining room <span className="font-semibold text-ink">{codeFromUrl.toUpperCase()}</span>
                </p>
              ) : (
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="Room code"
                  maxLength={4}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-center text-lg uppercase tracking-widest outline-none focus:border-accent"
                />
              )}
              <button
                disabled={busy}
                onClick={handleJoin}
                className="w-full rounded-lg bg-accent px-4 py-3 text-lg font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
              >
                Enter
              </button>
            </>
          )}

          {!codeFromUrl && (
            <button onClick={() => setMode('choose')} className="text-sm text-ink-muted underline hover:text-ink">
              Back
            </button>
          )}
        </>
      )}

      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
