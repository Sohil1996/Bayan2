'use client';
import { useState } from 'react';
import { GLOBAL } from '@/content';
import { usePrefs } from '@/lib/prefs';

/** In-thread setup questions before a character or duo chat (1 of 4 …). */
export function SetupCard({ names, duo, onDone }: { names: string; duo: boolean; onDone: (answers: string[], length: 0 | 1 | 2) => void }) {
  const { lang } = usePrefs();
  const S = GLOBAL.duo.setup[lang] as (typeof GLOBAL.duo.setup)['en'] & { ui: Record<string, string> };
  const steps: [string, string[]][] = [...(duo ? S.two : S.one), S.tone, S.len];
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [q, opts] = steps[i];
  const choose = (a: string, idx: number) => {
    const next = [...answers, a];
    if (i === steps.length - 1) onDone(next, idx as 0 | 1 | 2);
    else {
      setAnswers(next);
      setI(i + 1);
    }
  };
  return (
    <section aria-label={S.ui.t} className="surface-card max-w-[440px] rounded-[22px] p-4 animate-rise">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xs font-semibold tracking-[0.14em] text-gold-ink uppercase">{S.ui.t}</p>
        <p className="text-2xs text-fg-subtle">
          {i + 1} {S.ui.of} {steps.length}
        </p>
      </div>
      <p className="mt-0.5 text-xs text-fg-subtle">
        {S.ui.with_} {names}
      </p>
      <h3 className="mt-2 text-base font-semibold text-fg-strong">{q}</h3>
      <div className="mt-3 flex flex-col gap-1.5">
        {opts.map((o, idx) => (
          <button key={o} type="button" onClick={() => choose(o, idx)} className="focus-ring glass flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2 text-start text-sm text-fg hover:brightness-110">
            <span className="grid size-5 shrink-0 place-items-center rounded-full border border-line text-[0.6rem] font-semibold text-fg-muted">{String.fromCharCode(65 + idx)}</span>
            {o}
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-between">
        <button type="button" onClick={() => onDone([], 1)} className="focus-ring rounded text-xs text-fg-muted underline-offset-4 hover:underline">
          {S.ui.skip}
        </button>
        {i > 0 && (
          <button
            type="button"
            onClick={() => {
              setI(i - 1);
              setAnswers(answers.slice(0, -1));
            }}
            className="focus-ring rounded text-xs text-fg-muted underline-offset-4 hover:underline"
          >
            {S.ui.back}
          </button>
        )}
      </div>
    </section>
  );
}
