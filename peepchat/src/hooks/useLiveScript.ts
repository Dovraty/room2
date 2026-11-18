import { useEffect, useRef, useState } from 'react';
import type { Conversation, Message } from '@/data';

export type LiveMessage = Message & { id: string; at: number };

/**
 * Simulated live feed: replays `script` after `seed`, with a typing phase whose length
 * scales with message length. Returns messages so far + who is typing.
 */
export function useLiveScript(convo: Conversation | undefined, opts: { speed?: number; paused?: boolean } = {}) {
  const { speed = 1, paused = false } = opts;
  const [messages, setMessages] = useState<LiveMessage[]>(() =>
    (convo?.seed ?? []).map((m, i) => ({ ...m, id: `s${i}`, at: Date.now() - (60 - i) * 20000 })),
  );
  const [typing, setTyping] = useState<string | null>(null);
  const [pending, setPending] = useState<{ msg: Message; ms: number; startedAt: number } | null>(null);
  const idx = useRef(0);

  useEffect(() => {
    if (!convo?.script || paused) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!alive) return;
      const next = convo.script![idx.current];
      if (!next) {
        setTyping(null);
        return;
      }
      setTyping(next.from);
      const typeMs = Math.min(2600, 700 + next.text.length * 28) / speed;
      setPending({ msg: next, ms: typeMs, startedAt: Date.now() });
      timer = setTimeout(() => {
        if (!alive) return;
        setTyping(null);
        setPending(null);
        setMessages((prev) => [...prev, { ...next, id: `l${idx.current}`, at: Date.now() }]);
        idx.current += 1;
        timer = setTimeout(step, (900 + Math.random() * 1100) / speed);
      }, typeMs);
    };
    timer = setTimeout(step, 1400 / speed);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [convo, speed, paused]);

  return { messages, typing, pending };
}
