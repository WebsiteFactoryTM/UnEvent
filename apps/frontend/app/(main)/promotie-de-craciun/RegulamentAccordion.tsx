"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

export function RegulamentAccordion() {
  const [isRegulamentOpen, setIsRegulamentOpen] = useState(false);

  return (
    <div className="glass-card p-6 md:p-8">
      <button
        onClick={() => setIsRegulamentOpen(!isRegulamentOpen)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <h2 className="text-2xl md:text-3xl font-bold">
          📄 REGULAMENTUL CAMPANIEI PROMOȚIONALE „UN:EVENT - LANSARE"
        </h2>
        {isRegulamentOpen ? (
          <FaChevronUp className="h-5 w-5 shrink-0" />
        ) : (
          <FaChevronDown className="h-5 w-5 shrink-0" />
        )}
      </button>

      {isRegulamentOpen && (
        <div className="mt-6 space-y-6 text-sm md:text-base text-muted-foreground">
          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 1. ORGANIZATORUL
            </h3>
            <p>
              Campania este organizată de [PIXEL FACTORY SRL], cu sediul în
              Ghiroda, Str. Bega, nr. 47, jud. Timiș, CUI 47452355, denumită în
              continuare „Organizatorul".
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 2. DURATA CAMPANIEI
            </h3>
            <p>
              Campania se desfășoară începând cu data lansării oficiale și se
              încheie la data de 24 Decembrie 2025, ora 12:00.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 3. DREPTUL DE PARTICIPARE
            </h3>
            <p>
              Pot participa la campanie toate persoanele juridice și fizice
              autorizate (PFA/II) care își creează un cont și listează activ o
              locație, un serviciu sau un eveniment pe platforma UN:EVENT în
              perioada campaniei. Profilurile incomplete sau inactive nu vor
              intra în extragere.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 4. PREMIILE
            </h3>
            <p className="mb-2">
              Se vor acorda, prin tragere la sorți, următoarele premii:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                5 x Status „Recomandat" pentru categoria Locații (valabilitate:
                nedeterminată/pe viață).
              </li>
              <li>
                5 x Status „Recomandat" pentru categoria Servicii (valabilitate:
                nedeterminată/pe viață).
              </li>
              <li>
                5 x Status „Recomandat" pentru categoria Evenimente
                (valabilitate: nedeterminată/pe viață).
              </li>
            </ul>
            <p className="mt-2">
              <strong>Notă:</strong> Premiile nu pot fi preschimbate în bani și
              nu sunt transferabile către alte entități.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 5. DESEMNAREA CÂȘTIGĂTORILOR
            </h3>
            <p>
              Extragerea va avea loc pe data de 24 Decembrie 2025, utilizând un
              serviciu randomizat (ex: random.org). Câștigătorii vor fi anunțați
              pe canalele de social media UN:EVENT și contactați prin
              email/telefon.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 6. PROTECȚIA DATELOR
            </h3>
            <p>
              Prin participarea la campanie, participanții sunt de acord cu
              prelucrarea datelor cu caracter personal în scopul validării și
              acordării premiilor, conform Politicii de Confidențialitate a
              platformei.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-2">
              SECȚIUNEA 7. LITIGII
            </h3>
            <p>
              Eventualele litigii apărute între Organizator și participanți se
              vor rezolva pe cale amiabilă.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
