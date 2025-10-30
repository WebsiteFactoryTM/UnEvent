import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaHouse } from "react-icons/fa6";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Termeni și Condiții | UN:EVENT",
  description:
    "Termenii și condițiile de utilizare a platformei UN:EVENT. Informații despre responsabilitățile utilizatorilor, serviciile oferite și politicile platformei.",
};

export default function TermeniSiConditiiPage() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="mb-6 md:mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              <FaHouse className="h-4 w-4" />
            </Link>
            <FaChevronRight className="h-3 w-3" />
            <span className="text-foreground">Termeni și Condiții</span>
          </nav>

          {/* Main Content */}
          <article className="glass-card p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
            <header className="space-y-4 border-b border-border pb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Termeni și Condiții de Utilizare — UN:EVENT
              </h1>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4 sm:p-6 space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Versiunea 1.0 – actualizat la 12 septembrie 2025
                </p>
                <div className="space-y-1 text-foreground/80">
                  <p className="font-semibold">SC PIXEL FACTORY SRL</p>
                  <p>CUI: 47452355 / Reg. Com.: J35/154/2023</p>
                  <p>Sediu social: Str. Bega, nr. 47, Ghiroda, Timiș</p>
                  <p>
                    E-mail:{" "}
                    <a
                      href="mailto:contact@unevent.ro"
                      className="text-primary hover:underline"
                    >
                      contact@unevent.ro
                    </a>
                  </p>
                  <p>Formular de contact: pagina /contact</p>
                </div>
              </div>
            </header>

            <div className="space-y-6 md:space-y-8 text-foreground/90 leading-relaxed">
              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  1) Cine suntem și ce este acest document
                </h2>
                <p>
                  Prezentele Termeni și Condiții de Utilizare („Termenii")
                  reglementează accesul și folosirea platformei UN:EVENT
                  (denumită în continuare „Platforma"), disponibilă la adresa
                  unevent.ro, administrată de:
                </p>
                <p>
                  Prin utilizarea Platformei, crearea unui cont sau publicarea
                  unei listări (serviciu, locație ori eveniment), confirmați că
                  ați citit, înțeles și acceptat integral acești Termeni, precum
                  și Politica de confidențialitate și Politica de cookie.
                </p>
                <p>
                  Dacă nu sunteți de acord cu acești Termeni, vă rugăm să nu
                  utilizați Platforma.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  2) Descrierea Platformei (rol, funcționalități, limitări)
                </h2>
                <p>
                  UN:EVENT este o platformă online care facilitează listarea și
                  descoperirea de:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Locații pentru evenimente (ex.: săli, spații private,
                    restaurante, studiouri etc.);
                  </li>
                  <li>
                    Prestatori de servicii sau Servicii (ex.: DJ, trupe,
                    foto/video, catering, organizatori, decoratori etc.);
                  </li>
                  <li>
                    Evenimente (ex.: concerte, ateliere, expoziții, piese de
                    teatru, party-uri etc.).
                  </li>
                </ul>
                <p>
                  Platforma oferă funcții de publicare listări, profil
                  organizator/prestator, mesagerie internă, recenzii/ratings,
                  moderare și opțiuni de promovare (contra cost). În versiunile
                  ulterioare, Platforma poate include opțiuni de rezervare
                  și/sau plată integrată (prin procesatori terți).
                </p>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 sm:p-6 space-y-4 mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Rolul limitat al Platformei
                  </h3>
                  <ul className="space-y-3 text-sm sm:text-base text-foreground/90">
                    <li className="flex gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        UN:EVENT este un intermediar tehnic (marketplace/listing
                        directory).
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        NU este organizatorul evenimentelor, NU este
                        proprietarul/administratorul locațiilor, NU este
                        prestatorul efectiv al serviciilor și NU este
                        agent/mandatar al utilizatorilor, în afara cazului
                        limitat de încasare a plăților pentru
                        promovare/abonamente/comisioane sau, în viitor, dacă va
                        acționa ca agent limitat de încasare pentru
                        prestatori/gazde (doar pentru a primi și a transfera
                        sumele către aceștia, după rețineri contractuale).
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>
                        UN:EVENT și SC PIXEL FACTORY SRL nu își asumă nicio
                        obligație sau răspundere cu privire la relația dintre
                        Clientul final (utilizatorul care rezervă/cumpără) și
                        Lister (cel care publică o locație, un serviciu sau un
                        eveniment), inclusiv dar fără a se limita la: calitate,
                        conformitate legală, siguranță, disponibilitate, preț,
                        termene, anulări, daune, certificate/avize (inclusiv
                        ISU), autorizații, asigurări.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  3) Acceptarea Termenilor. Contul de utilizator
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Crearea unui cont este permisă persoanelor de minimum 18
                    ani.
                  </li>
                  <li>
                    La crearea contului, acceptați acești Termeni, Politica de
                    confidențialitate și Politica de cookie.
                  </li>
                  <li>Sunteți responsabil(ă) pentru:</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 ml-8">
                  <li>veridicitatea datelor furnizate;</li>
                  <li>confidențialitatea datelor de autentificare;</li>
                  <li>
                    orice activitate desfășurată sub contul dumneavoastră.
                  </li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  4) Responsabilitățile Lister-ului (cel care publică o listare)
                </h2>
                <p className="font-semibold">
                  Dacă publicați o locație, un serviciu sau un eveniment,
                  garantați că:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Dețineți toate drepturile necesare (proprietate, mandat,
                    licență) pentru a oferi acel serviciu/locație sau a organiza
                    evenimentul;
                  </li>
                  <li>
                    Informațiile publicate (descriere, fotografii, preț,
                    disponibilitate) sunt corecte, actualizate și complete;
                  </li>
                  <li>
                    Respectați legislația aplicabilă (autorizații, avize ISU,
                    certificate de securitate la incendiu, asigurări de
                    răspundere civilă, norme sanitare, fiscale etc.);
                  </li>
                  <li>
                    Vă asumați integral răspunderea pentru calitatea, siguranța
                    și legalitatea serviciului/locației/ evenimentului oferit;
                  </li>
                  <li>
                    Veți onora rezervările/comenzile confirmate, în condițiile
                    și la prețul afișat, cu excepția cazurilor de forță majoră
                    sau anulare conformă cu politica proprie de anulare (dacă
                    există).
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  5) Plăți și comisioane
                </h2>
                <p>
                  Platforma poate percepe comisioane pentru servicii de
                  promovare, abonamente premium sau, în viitor, pentru
                  intermedierea rezervărilor/plăților.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Comisioanele și tarifele sunt afișate transparent înainte de
                    finalizarea unei tranzacții sau abonament.
                  </li>
                  <li>
                    Plățile se pot efectua prin procesatori terți (ex.:
                    Stripe/Netopia). Pot fi percepute taxe de procesare.
                  </li>
                  <li>
                    Pentru serviciile digitale (promovare/abonamente), sumele
                    plătite pot fi nerambursabile, cu excepția cazurilor
                    prevăzute de lege sau de politica de retur indicată în
                    Platformă.
                  </li>
                </ul>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 sm:p-6 space-y-4 mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Dreptul de retragere (consumatori)
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/90">
                    Dacă achiziționați, în calitate de consumator, servicii
                    digitale cu executare imediată, vă putem solicita acordul
                    expres pentru începerea prestării și confirmarea că
                    renunțați la dreptul legal de retragere (conform OUG
                    34/2014). În lipsa începerii prestării, dreptul de retragere
                    poate fi exercitat în 14 zile de la achiziție, potrivit
                    legii.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  6) Rezervări și plăți (funcționalitate viitoare)
                </h2>
                <p>
                  Dacă Platforma va intermedia în viitor plăți pentru rezervări,
                  se vor aplica termeni suplimentari specifici.
                </p>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6 space-y-4 mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Viitoare plăți de rezervare
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/90">
                    Dacă Platforma va intermedia încasarea sumelor pentru
                    rezervări:
                  </p>
                  <ul className="space-y-3 text-sm sm:text-base text-foreground/90">
                    <li className="flex gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        SC PIXEL FACTORY SRL poate acționa ca agent limitat de
                        încasare pentru Lister, în scopul primirii plăților de
                        la Clientul final și transferului sumelor (după
                        rețineri/comisioane);
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        Listerul rămâne singurul responsabil pentru emiterea
                        documentelor fiscale către Client, pentru taxe/impuneri
                        aferente și pentru îndeplinirea obligațiilor
                        post-vânzare.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  7) Conținut generat de utilizatori (recenzii, fotografii,
                  descrieri)
                </h2>
                <p>
                  Utilizatorii pot posta recenzii, fotografii, comentarii sau
                  alte materiale. Prin postare, garantați că:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Conținutul este adevărat, nu încalcă drepturile terților și
                    nu este ilegal;
                  </li>
                  <li>
                    Acordați Platformei o licență neexclusivă, gratuită,
                    perpetuă, de utilizare, reproducere, distribuire și afișare
                    a conținutului în scopuri de funcționare și promovare a
                    Platformei;
                  </li>
                  <li>
                    Platforma își rezervă dreptul de a modera, edita sau șterge
                    conținut care încalcă acești Termeni sau legislația.
                  </li>
                </ul>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  8) Conduită interzisă
                </h2>
                <p>Este interzis să:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Postați informații false, înșelătoare sau ilegale;</li>
                  <li>
                    Încălcați drepturile de proprietate intelectuală ale
                    terților;
                  </li>
                  <li>
                    Utilizați Platforma în scopuri frauduloase sau pentru
                    activități ilegale;
                  </li>
                  <li>
                    Hărțuiți, amenințați sau discriminați alți utilizatori;
                  </li>
                  <li>
                    Încercați să accesați neautorizat sistemele Platformei sau
                    să perturbați funcționarea acesteia.
                  </li>
                </ul>
              </section>

              {/* Section 9 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  9) Relația Lister – Client final (contractarea directă)
                </h2>
                <p>
                  Orice rezervare/achiziție între Lister și Clientul final
                  constituie un contract direct între aceștia.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Condițiile comerciale (preț, anulare, reprogramare,
                    garanții, răspundere, rambursări etc.) sunt stabilite de
                    Lister și nu implică obligații pentru Platformă.
                  </li>
                  <li>
                    UN:EVENT și SC PIXEL FACTORY SRL nu sunt parte în acest
                    contract și nu răspund pentru neexecutare, executare
                    defectuoasă, anulări, întârzieri, prejudicii sau litigii
                    dintre părți.
                  </li>
                </ul>
              </section>

              {/* Section 10 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  10) Proprietate intelectuală a Platformei
                </h2>
                <p>
                  Toate elementele Platformei (cod, design, siglă, marca
                  UN:EVENT, baze de date, texte, grafice) sunt protejate de
                  drepturi de autor/marcă. Folosirea lor fără permisiune expresă
                  scrisă este interzisă.
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  11) Limitarea răspunderii. Declarații și garanții
                </h2>
                <p>
                  Platforma este furnizată „ca atare" („as is"), fără garanții
                  exprese sau implicite privind disponibilitatea, acuratețea sau
                  funcționarea neîntreruptă.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    SC PIXEL FACTORY SRL nu garantează că listările sunt
                    corecte, complete sau actualizate în permanență;
                  </li>
                  <li>
                    Nu răspunde pentru daune directe, indirecte, pierderi de
                    profit, pierderi de date sau alte prejudicii rezultate din
                    utilizarea sau imposibilitatea de utilizare a Platformei;
                  </li>
                  <li>
                    Nu răspunde pentru acțiunile sau omisiunile Lister-ilor sau
                    ale Clienților finali, inclusiv pentru calitatea, siguranța
                    sau legalitatea serviciilor/locațiilor/evenimentelor
                    oferite.
                  </li>
                </ul>
                <p>
                  În măsura permisă de lege, răspunderea totală a SC PIXEL
                  FACTORY SRL este limitată la suma plătită de utilizator către
                  Platformă în ultimele 12 luni (dacă este cazul).
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  12) Suspendarea sau închiderea contului
                </h2>
                <p>
                  Platforma își rezervă dreptul de a suspenda sau închide orice
                  cont care:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Încalcă acești Termeni;</li>
                  <li>Postează conținut ilegal sau fraudulos;</li>
                  <li>
                    Generează reclamații repetate sau justificate din partea
                    altor utilizatori;
                  </li>
                  <li>
                    Este inactiv pentru o perioadă îndelungată (la discreția
                    Platformei).
                  </li>
                </ul>
              </section>

              {/* Section 13 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  13) Modificarea Termenilor
                </h2>
                <p>
                  SC PIXEL FACTORY SRL poate actualiza acești Termeni periodic.
                  Versiunea actualizată va fi publicată pe Platformă, cu
                  indicarea datei ultimei modificări. Utilizarea continuă a
                  Platformei după modificare echivalează cu acceptarea noilor
                  Termeni.
                </p>
              </section>

              {/* Section 14 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  14) Legea aplicabilă și soluționarea litigiilor
                </h2>
                <p>Acești Termeni sunt guvernați de legea română.</p>
                <p>
                  Orice litigiu va fi soluționat pe cale amiabilă. În caz
                  contrar, litigiile vor fi de competența instanțelor române
                  competente.
                </p>
                <p>
                  Consumatorii pot accesa platforma europeană de soluționare
                  online a litigiilor (SOL):{" "}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                </p>
              </section>

              {/* Section 15 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  15) Dispoziții finale
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Dacă o clauză din acești Termeni este declarată nulă sau
                    inaplicabilă, celelalte clauze rămân în vigoare.
                  </li>
                  <li>
                    Neexercitarea unui drept de către SC PIXEL FACTORY SRL nu
                    constituie renunțare la acel drept.
                  </li>
                  <li>
                    Acești Termeni constituie acordul integral între utilizator
                    și SC PIXEL FACTORY SRL cu privire la utilizarea Platformei.
                  </li>
                </ul>
              </section>

              {/* Section 16 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  16) Contact
                </h2>
                <p>
                  Pentru întrebări, reclamații sau solicitări legate de acești
                  Termeni, ne puteți contacta la:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>
                    Email:{" "}
                    <a
                      href="mailto:contact@unevent.ro"
                      className="text-primary hover:underline"
                    >
                      contact@unevent.ro
                    </a>
                  </li>
                  <li>Formular de contact: pagina /contact</li>
                  <li>
                    Adresă poștală: Str. Bega, nr. 47, Ghiroda, Timiș, România
                  </li>
                </ul>
              </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
              <p>
                Prin utilizarea platformei UN:EVENT, confirmați că ați citit,
                înțeles și acceptat acești Termeni și Condiții de Utilizare.
              </p>
              <p className="mt-2">Ultima actualizare: 12 septembrie 2025</p>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}
