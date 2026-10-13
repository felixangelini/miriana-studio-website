import { useState } from 'react';

type Item = { question: string; answer: string };

type Group = {
  index: string;
  title: string;
  items: Item[];
};

const groups: Group[] = [
  {
    index: '01',
    title: 'Branding e identità',
    items: [
      {
        question: 'Che cosa si intende per identità visiva?',
        answer:
          'È l’insieme degli elementi visivi che rendono riconoscibile un brand: logo, colori, tipografia, stile delle immagini ed elementi grafici. Definisce come il brand si presenta e viene percepito.',
      },
      {
        question: 'Qual è la differenza tra logo e identità visiva?',
        answer:
          'Il logo è un singolo elemento. L’identità visiva comprende anche colori, caratteri, immagini e stile grafico, organizzati in un sistema coerente.',
      },
      {
        question: 'Che differenza c’è tra branding e identità visiva?',
        answer:
          'Il branding definisce il posizionamento del brand, a chi si rivolge e come vuole essere percepito. L’identità visiva traduce queste scelte in elementi grafici concreti.',
      },
    ],
  },
  {
    index: '02',
    title: 'I servizi',
    items: [
      {
        question: 'Quale servizio è più adatto alla mia attività?',
        answer:
          'Brand Foundation è indicato se hai bisogno di costruire le basi visive del tuo progetto. Brand Identity se vuoi definire strategia e identità prima di presentarti sul mercato. Brand Direction se vuoi anche una guida nelle scelte creative e nell’applicazione dell’identità.',
      },
      {
        question: 'La mia attività è già avviata: posso rivolgermi a Miriana Studio?',
        answer:
          'Sì. Possiamo lavorare su un’identità da rinnovare, su una comunicazione che non rappresenta più la struttura o su un brand che ha bisogno di una direzione più chiara.',
      },
    ],
  },
  {
    index: '03',
    title: 'Il lavoro insieme',
    items: [
      {
        question: 'Collabori con fotografi, sviluppatori web e altri professionisti?',
        answer:
          'Sì. Nei percorsi che lo prevedono, posso coordinare le scelte creative con i professionisti coinvolti, affinché immagini, sito e materiali siano coerenti con l’identità del brand.',
      },
      {
        question: 'Quanto dura un progetto?',
        answer:
          'La durata dipende dal servizio scelto e dalla complessità del progetto. Tempi e fasi di lavoro vengono definiti prima di iniziare. In genere le tempistiche variano dalle 4 settimane e possono arrivare fino anche a 6 mesi.',
      },
    ],
  },
];

function AccordionItem({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  const panelId = item.question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <div className="border-b border-ink/15">
      <h4>
        <button
          type="button"
          className="flex w-full items-start justify-between gap-6 py-7 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-[17px] leading-snug text-ink">{item.question}</span>
          <span
            aria-hidden="true"
            className="mt-1 shrink-0 text-lg leading-none text-olive-soft"
          >
            {open ? '–' : '+'}
          </span>
        </button>
      </h4>
      <div
        id={panelId}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-7 pr-10 text-base leading-relaxed text-taupe">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqList() {
  return (
    <div className="flex flex-col">
      {groups.map((group, groupIndex) => (
        <section key={group.index} className={groupIndex === 0 ? '' : 'pt-16 md:pt-20'}>
          <div className="flex items-end gap-6 border-b border-ink/25 pb-3">
            <p className="pb-1 text-[10px] font-medium uppercase tracking-[2px] text-olive-soft">
              {group.index}
            </p>
            <h3 className="font-display text-2xl text-terracotta">{group.title}</h3>
          </div>
          {group.items.map((item) => (
            <AccordionItem key={item.question} item={item} />
          ))}
        </section>
      ))}
    </div>
  );
}
