import { Icon } from '../lib/icons';

interface Props {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}

export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 20 }}>
      <PageBtn onClick={() => onChange(page - 1)} disabled={page === 1} title="Anterior">
        <Icon name="chevron-left" size={14} />
      </PageBtn>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dot-${i}`} style={{ width: 32, textAlign: 'center', fontSize: 13, color: 'var(--muted-3)' }}>…</span>
        ) : (
          <PageBtn key={p} onClick={() => onChange(p as number)} active={p === page}>
            {p}
          </PageBtn>
        ),
      )}

      <PageBtn onClick={() => onChange(page + 1)} disabled={page === totalPages} title="Siguiente">
        <Icon name="chevron-right" size={14} />
      </PageBtn>
    </div>
  );
}

function PageBtn({
  children, onClick, active, disabled, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        minWidth: 32, height: 32, padding: '0 6px',
        border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
        borderRadius: 7, cursor: disabled ? 'default' : 'pointer',
        background: active ? 'var(--primary)' : 'var(--bg)',
        color: active ? '#fff' : disabled ? 'var(--muted-4)' : 'var(--text-2)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s',
      }}
    >
      {children}
    </button>
  );
}

function buildPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 1;
  const left = current - delta;
  const right = current + delta;
  const pages: (number | '…')[] = [];

  pages.push(1);
  if (left > 2) pages.push('…');
  for (let i = Math.max(2, left); i <= Math.min(total - 1, right); i++) pages.push(i);
  if (right < total - 1) pages.push('…');
  pages.push(total);

  return pages;
}
