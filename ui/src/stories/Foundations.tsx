/* Live token swatches for the Foundations docs pages. They read the CSS variables, so they follow the theme toolbar. */
const COLORS: [string, string, string][] = [
  ['--by-bg', 'bg', 'Page background'],
  ['--by-bg-raised', 'bg-raised', 'Raised surface'],
  ['--by-fg', 'fg', 'Body text'],
  ['--by-fg-strong', 'fg-strong', 'Titles'],
  ['--by-fg-muted', 'fg-muted', 'Secondary text'],
  ['--by-fg-subtle', 'fg-subtle', 'Placeholders, icons'],
  ['--by-line', 'line', 'Dividers, borders'],
  ['--by-gold', 'gold', 'Brand gold'],
  ['--by-gold-strong', 'gold-strong', 'Gold gradients'],
  ['--by-gold-ink', 'gold-ink', 'Gold text on background'],
  ['--by-blue', 'blue', 'Accent'],
  ['--by-navy', 'navy', 'Light-mode primary'],
  ['--by-primary', 'primary', 'Primary action'],
  ['--by-danger', 'danger', 'Errors, destructive'],
];

export function ColorSwatches() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
      {COLORS.map(([v, tw, use]) => (
        <div key={v} className="surface-card overflow-hidden rounded-card">
          <div style={{ height: 64, background: `var(${v})`, borderBottom: '1px solid var(--by-line)' }} />
          <div className="p-3 text-sm">
            <b className="block text-fg-strong">{tw}</b>
            <code className="text-2xs text-fg-subtle">{v}</code>
            <p className="mt-1 text-fg-muted">{use}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const SURFACES: [string, string][] = [
  ['glass', 'Chips, icon buttons, inputs, dock'],
  ['surface-card', 'List rows, recommendation cards'],
  ['surface-panel', 'Sign-in card, dialogs'],
  ['surface-bubble', 'Assistant message'],
  ['surface-tab-on', 'Selected tab or chip'],
  ['surface-outline-gold', 'Outlined gold action'],
  ['surface-suggestion', 'Suggestion chip'],
];

export function SurfaceSwatches() {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, padding: 20, borderRadius: 20, backgroundImage: 'linear-gradient(var(--by-scrim),var(--by-scrim)),url(./bg-dark.jpg)', backgroundSize: 'cover' }}
    >
      {SURFACES.map(([cls, use]) => (
        <div key={cls} className={`${cls} rounded-card border p-4 text-sm`} style={{ minHeight: 90 }}>
          <code className="font-semibold">.{cls}</code>
          <p className="mt-1 opacity-80">{use}</p>
        </div>
      ))}
    </div>
  );
}

const TYPE: [string, string, string][] = [
  ['text-display-xl font-display', '62 / display', 'Hero headline'],
  ['text-display-lg font-display', '36 / display', 'Page titles, balances'],
  ['text-display-md font-display', '22 / display', 'Column title'],
  ['text-display-sm font-display font-semibold', '18 / display', 'Section titles'],
  ['text-md', '15 / sans', 'Inputs, buttons'],
  ['text-base', '14.5 / sans', 'Chat text, card titles'],
  ['text-sm', '12.5 / sans', 'Chips, captions'],
  ['text-2xs', '11 / sans', 'Dock labels, tags'],
];

export function TypeScale({ sample }: { sample: string }) {
  return (
    <div className="flex flex-col gap-4">
      {TYPE.map(([cls, size, use]) => (
        <div key={cls} className="flex items-baseline gap-6 border-b border-line pb-3">
          <code className="w-40 shrink-0 text-2xs text-fg-subtle">{size}</code>
          <span className={`${cls} min-w-0 flex-1 truncate text-fg-strong`}>{sample}</span>
          <span className="hidden w-44 shrink-0 text-sm text-fg-muted md:block">{use}</span>
        </div>
      ))}
    </div>
  );
}

const RADII: [string, string][] = [
  ['rounded-cover', '6px · small covers'],
  ['rounded-thumb', '10px · thumbnails'],
  ['rounded-card', '16px · cards, rows'],
  ['rounded-bubble', '26px · messages'],
  ['rounded-panel', '30px · panels'],
  ['rounded-full', 'pill · buttons, chips, inputs'],
];

export function RadiusScale() {
  return (
    <div className="flex flex-wrap gap-4">
      {RADII.map(([cls, use]) => (
        <div key={cls} className="text-center text-sm">
          <div className={`${cls} surface-card mx-auto size-20`} />
          <code className="mt-2 block text-fg-strong">{cls}</code>
          <span className="text-2xs text-fg-muted">{use}</span>
        </div>
      ))}
    </div>
  );
}
