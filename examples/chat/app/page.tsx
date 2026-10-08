'use client';

import { useState } from 'react';

type Lang = 'English' | 'Japanese';

interface Message {
  id: number;
  author: Lang;
  original: string;
  translated: string;
  warnings: string[];
}

const PANELS: {
  lang: Lang;
  title: string;
  placeholder: string;
  send: string;
}[] = [
  {
    lang: 'English',
    title: 'English',
    placeholder: 'Type a message…',
    send: 'Send',
  },
  {
    lang: 'Japanese',
    title: '日本語',
    placeholder: 'メッセージを入力…',
    send: '送信',
  },
];

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [drafts, setDrafts] = useState<Record<Lang, string>>({
    English: '',
    Japanese: '',
  });
  const [loading, setLoading] = useState<Lang | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(author: Lang) {
    const text = drafts[author].trim();
    if (!text || loading) return;

    const to: Lang = author === 'English' ? 'Japanese' : 'English';
    setLoading(author);
    setError(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: author, to }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Translation failed');

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length,
          author,
          original: text,
          translated: data.text,
          warnings: data.warnings ?? [],
        },
      ]);
      setDrafts((prev) => ({ ...prev, [author]: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(null);
    }
  }

  function renderPanel(panel: (typeof PANELS)[number]) {
    return (
      <section
        key={panel.lang}
        className='flex h-full min-h-0 flex-col border-neutral-300 first:border-r dark:border-neutral-700'>
        <h2 className='border-b border-neutral-300 px-4 py-3 text-sm font-semibold dark:border-neutral-700'>
          {panel.title}
        </h2>

        <div className='flex-1 space-y-3 overflow-y-auto p-4'>
          {messages.map((m) => {
            const mine = m.author === panel.lang;
            return (
              <div
                key={m.id}
                className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm ' +
                    (mine
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100')
                  }>
                  <p className='whitespace-pre-wrap'>
                    {mine ? m.original : m.translated}
                  </p>
                  {!mine && m.warnings.length > 0 && (
                    <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                      ⚠ {m.warnings.join(' · ')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className='flex gap-2 border-t border-neutral-300 p-3 dark:border-neutral-700'>
          <textarea
            value={drafts[panel.lang]}
            onChange={(e) =>
              setDrafts((prev) => ({ ...prev, [panel.lang]: e.target.value }))
            }
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                send(panel.lang);
              }
            }}
            maxLength={1000}
            rows={2}
            placeholder={panel.placeholder}
            className='flex-1 resize-none rounded-lg border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700'
          />
          <button
            onClick={() => send(panel.lang)}
            disabled={loading !== null || !drafts[panel.lang].trim()}
            className='self-end rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40'>
            {loading === panel.lang ? '…' : panel.send}
          </button>
        </div>
      </section>
    );
  }

  return (
    <main className='flex h-screen flex-col'>
      {error && (
        <div className='bg-red-600 px-4 py-2 text-sm text-white'>{error}</div>
      )}
      <div className='grid min-h-0 flex-1 grid-cols-2'>
        {PANELS.map(renderPanel)}
      </div>
    </main>
  );
}
