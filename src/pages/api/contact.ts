import type { APIRoute } from 'astro';
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  structure?: unknown;
  email?: unknown;
  phone?: unknown;
  project?: unknown;
  company_fax?: unknown;
  /** @deprecated honeypot vecchio — ignorato se presente */
  website?: unknown;
};

function asTrimmedString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
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
  const project = asTrimmedString(body.project, 4000);

  if (!name || !email || !project) {
    return json(400, { ok: false, error: 'Compila i campi obbligatori.' });
  }

  if (!EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Indirizzo email non valido.' });
  }

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing');
    return json(500, { ok: false, error: 'Configurazione email mancante.' });
  }

  const to = CONTACT_TO || 'info@mirianastudio.it';
  const from = CONTACT_FROM || 'Miriana Studio <onboarding@resend.dev>';

  const resend = new Resend(RESEND_API_KEY);

  const textLines = [
    `Nome: ${name}`,
    structure ? `Struttura / progetto: ${structure}` : null,
    `Email: ${email}`,
    phone ? `Telefono: ${phone}` : null,
    '',
    'Messaggio:',
    project,
  ].filter((line): line is string => line !== null);

  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: email,
    subject: `Nuovo contatto — ${name}`,
    text: textLines.join('\n'),
    html: `
      <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
      ${structure ? `<p><strong>Struttura / progetto:</strong> ${escapeHtml(structure)}</p>` : ''}
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>` : ''}
      <p><strong>Messaggio:</strong></p>
      <p>${escapeHtml(project).replace(/\n/g, '<br />')}</p>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return json(500, { ok: false, error: 'Invio non riuscito. Riprova più tardi.' });
  }

  return json(200, { ok: true });
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
