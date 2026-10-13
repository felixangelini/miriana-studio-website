import type { APIRoute } from 'astro';
import { CONTACT_FROM, CONTACT_TO, RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BRAND_CHECK_URL = 'https://hospitalitybrandcheck.netlify.app/';

type AuditBody = {
  email?: unknown;
  company_fax?: unknown;
};

function asTrimmedString(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

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

function thankYouText(): string {
  return [
    'Ciao,',
    '',
    'grazie per aver lasciato la tua email.',
    '',
    'Qui trovi l’Hospitality Brand Check: un breve questionario per capire quanto la comunicazione della tua struttura riflette il valore dell’esperienza che offri agli ospiti.',
    '',
    `Apri il questionario: ${BRAND_CHECK_URL}`,
    '',
    'Le domande riguardano identità visiva, coerenza tra sito, social e materiali, e quanto il brand si distingue da strutture simili. Alla fine ottieni una prima lettura: su cosa concentrarti e quale può essere il passo successivo.',
    '',
    'Non è un audit completo. È un modo concreto per orientarti, prima di decidere se ha senso parlarne insieme.',
    '',
    'Quando hai un momento, compilalo con calma.',
    '',
    'Miriana',
    'Miriana Studio',
  ].join('\n');
}

function thankYouHtml(): string {
  return `
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Ciao,</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">grazie per aver lasciato la tua email.</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Qui trovi l’<strong>Hospitality Brand Check</strong>: un breve questionario per capire quanto la comunicazione della tua struttura riflette il valore dell’esperienza che offri agli ospiti.</p>
    <p style="margin:0 0 16px;">
      <a href="${BRAND_CHECK_URL}" style="color:#7d3107;font-family:Georgia,serif;font-size:16px;">Apri il questionario</a>
    </p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Le domande riguardano identità visiva, coerenza tra sito, social e materiali, e quanto il brand si distingue da strutture simili. Alla fine ottieni una prima lettura: su cosa concentrarti e quale può essere il passo successivo.</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Non è un audit completo. È un modo concreto per orientarti, prima di decidere se ha senso parlarne insieme.</p>
    <p style="margin:0 0 16px;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Quando hai un momento, compilalo con calma.</p>
    <p style="margin:0;font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#1c1d15;">Miriana<br />Miriana Studio</p>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const POST: APIRoute = async ({ request }) => {
  let body: AuditBody;
  try {
    body = (await request.json()) as AuditBody;
  } catch {
    return json(400, { ok: false, error: 'Richiesta non valida.' });
  }

  if (asTrimmedString(body.company_fax, 200)) {
    console.warn('Audit honeypot triggered — email not sent');
    return json(200, { ok: true });
  }

  const email = asTrimmedString(body.email, 160);
  if (!email || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Indirizzo email non valido.' });
  }

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
    const { error: thankYouError } = await resend.emails.send({
      from,
      to: [email],
      replyTo: to,
      subject: 'A che punto è la comunicazione del tuo brand',
      text: thankYouText(),
      html: thankYouHtml(),
    });

    if (thankYouError) {
      console.error('Resend thank-you error:', thankYouError);
      return json(500, {
        ok: false,
        error: 'Invio non riuscito. Controlla dominio mittente e API key Resend.',
      });
    }

    const { error: noticeError } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: 'Richiesta mini audit',
      text: `Email: ${email}\n\nHa chiesto l’Hospitality Brand Check. È stata inviata la mail con il link:\n${BRAND_CHECK_URL}`,
      html: `<p><strong>Email:</strong> ${escapeHtml(email)}</p><p>Ha chiesto l’Hospitality Brand Check. È stata inviata la mail con il link:</p><p><a href="${BRAND_CHECK_URL}">${BRAND_CHECK_URL}</a></p>`,
    });

    if (noticeError) {
      console.error('Resend studio notice error:', noticeError);
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error('Audit API unexpected error:', err);
    return json(500, { ok: false, error: 'Invio non riuscito. Riprova più tardi.' });
  }
};
