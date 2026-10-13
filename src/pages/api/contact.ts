import type { APIRoute } from 'astro';
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';
import { percorsoLabel } from '../../data/percorsi';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  structure?: unknown;
  email?: unknown;
  phone?: unknown;
  percorso?: unknown;
  project?: unknown;
  company_fax?: unknown;
  /** @deprecated honeypot vecchio — ignorato se presente */
  website?: unknown;
};

function asTrimmedString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/** Rimuove virgolette accidentali da valori env (tipiche del copy da .env) */
function cleanEnv(value: string | undefined): string {
  if (!value) return '';
  return value.trim().replace(/^["']|["']$/g, '');
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return json(400, { ok: false, error: 'Richiesta non valida.' });
  }

  // Honeypot: bots fill this; humans never see it
  if (
    asTrimmedString(body.company_fax, 200) ||
    asTrimmedString(body.website, 200)
  ) {
    console.warn('Contact honeypot triggered — email not sent');
    return json(200, { ok: true });
  }

  const name = asTrimmedString(body.name, 120);
  const structure = asTrimmedString(body.structure, 160);
  const email = asTrimmedString(body.email, 160);
  const phone = asTrimmedString(body.phone, 40);
  const percorso = percorsoLabel(asTrimmedString(body.percorso, 40));
  const project = asTrimmedString(body.project, 4000);

  if (!name || !email) {
    return json(400, { ok: false, error: 'Compila i campi obbligatori.' });
  }

  if (!EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Indirizzo email non valido.' });
  }

  // Su Vercel process.env è la fonte più affidabile; astro:env come fallback
  const apiKey = cleanEnv(process.env.RESEND_API_KEY) || cleanEnv(RESEND_API_KEY);
  if (!apiKey) {
    console.error('RESEND_API_KEY is missing on server');
    return json(500, {
      ok: false,
      error: 'Configurazione email mancante. Imposta RESEND_API_KEY su Vercel.',
    });
  }

  const to =
    cleanEnv(process.env.CONTACT_TO) ||
    cleanEnv(CONTACT_TO) ||
    'info@mirianastudio.it';
  const from =
    cleanEnv(process.env.CONTACT_FROM) ||
    cleanEnv(CONTACT_FROM) ||
    'Miriana Studio <onboarding@resend.dev>';

  try {
    const resend = new Resend(apiKey);
    const textLines = [
      `Nome: ${name}`,
      structure ? `Struttura / progetto: ${structure}` : null,
      `Email: ${email}`,
      phone ? `Telefono: ${phone}` : null,
      percorso ? `Percorso: ${percorso}` : null,
      project ? '' : null,
      project ? 'Messaggio:' : null,
      project || null,
    ].filter((line): line is string => line !== null);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: percorso ? `Nuovo contatto — ${name} — ${percorso}` : `Nuovo contatto — ${name}`,
      text: textLines.join('\n'),
      html: `
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      ${structure ? `<p><strong>Struttura / progetto:</strong> ${escapeHtml(structure)}</p>` : ''}
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>` : ''}
      ${percorso ? `<p><strong>Percorso:</strong> ${escapeHtml(percorso)}</p>` : ''}
      ${
        project
          ? `<p><strong>Messaggio:</strong></p><p>${escapeHtml(project).replace(/\n/g, '<br />')}</p>`
          : ''
      }
    `,
    });

    if (error) {
      console.error('Resend error:', error);
      return json(500, {
        ok: false,
        error: 'Invio non riuscito. Controlla dominio mittente e API key Resend.',
      });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('Contact API unexpected error:', err);
    return json(500, { ok: false, error: 'Invio non riuscito. Riprova più tardi.' });
  }
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
