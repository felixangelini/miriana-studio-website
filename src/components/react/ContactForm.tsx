import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'success' | 'error';

const fieldWrap =
  'border-b border-sand/60 py-5';

const labelClass =
  'mb-3 block text-[10px] font-medium uppercase tracking-[2px] text-taupe';

const inputClass =
  'w-full border-0 bg-transparent text-[13.76px] text-ink outline-none placeholder:text-sand';

export default function ContactForm() {
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          structure: data.get('structure'),
          email: data.get('email'),
          phone: data.get('phone'),
          project: data.get('project'),
          // honeypot — non usare nomi tipo website/url (autofill browser)
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
    <form onSubmit={onSubmit} noValidate className="relative w-full">
      <div
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="company_fax">Fax</label>
        <input
          id="company_fax"
          name="company_fax"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className={fieldWrap}>
        <label className={labelClass} htmlFor="name">
          Nome e cognome <span className="text-terracotta">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Nome e cognome"
          className={inputClass}
        />
      </div>

      <div className={fieldWrap}>
        <label className={labelClass} htmlFor="structure">
          Nome della struttura / progetto
        </label>
        <input
          id="structure"
          name="structure"
          type="text"
          autoComplete="organization"
          placeholder="Nome della struttura / progetto"
          className={inputClass}
        />
      </div>

      <div className={fieldWrap}>
        <label className={labelClass} htmlFor="email">
          Email <span className="text-terracotta">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className={inputClass}
        />
      </div>

      <div className={fieldWrap}>
        <label className={labelClass} htmlFor="phone">
          Numero di telefono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Numero di telefono"
          className={inputClass}
        />
      </div>

      <div className={fieldWrap}>
        <label className={labelClass} htmlFor="project">
          Il progetto <span className="text-terracotta">*</span>
        </label>
        <textarea
          id="project"
          name="project"
          required
          rows={5}
          placeholder="Descrivi la tua struttura, dove sei, cosa vuoi comunicare..."
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="border border-ink/20 px-8 py-4 text-[10px] font-medium uppercase tracking-[2px] text-ink transition-opacity hover:opacity-70 disabled:cursor-wait disabled:opacity-50"
        >
          {status === 'sending' ? 'Invio in corso…' : 'Invia il messaggio'}
        </button>
      </div>

      <div className="mt-6 min-h-6" aria-live="polite">
        {status === 'success' && (
          <p className="text-sm text-ink">Messaggio inviato. Ti rispondo a breve.</p>
        )}
        {status === 'error' && (
          <p className="text-sm text-terracotta">{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
