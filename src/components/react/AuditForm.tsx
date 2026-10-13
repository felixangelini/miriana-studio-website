import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function AuditForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          company_fax: data.get('company_fax'),
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!res.ok || !payload?.ok) {
        setStatus('error');
        setErrorMessage(payload?.error || 'Invio non riuscito. Riprova più tardi.');
        return;
      }

      form.reset();
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Invio non riuscito. Riprova più tardi.');
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative mt-8 w-full max-w-lg">
      <div
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="audit-fax">Fax</label>
        <input
          id="audit-fax"
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col border-y border-ink/35 sm:flex-row">
        <label htmlFor="audit-email" className="sr-only">
          La tua email professionale
        </label>
        <input
          id="audit-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="La tua email professionale"
          className="min-w-0 flex-1 bg-transparent px-0 py-5 text-[13px] text-ink outline-none placeholder:text-ink/50"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-olive-soft px-7 py-5 text-[10px] font-medium uppercase tracking-[2px] text-cream transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'sending' ? 'Invio…' : 'Ricevi il link →'}
        </button>
      </div>

      <p className="mt-4 min-h-5 text-[13px] leading-relaxed text-ink/70" role="status">
        {status === 'success' &&
          'Controlla la tua casella di posta elettronica e compila il questionario.'}
        {status === 'error' && errorMessage}
      </p>
    </form>
  );
}
