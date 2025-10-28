import type { Metadata } from "next"
import Link from "next/link"
import { FaHouse, FaChevronRight } from "react-icons/fa6"
import { ScrollToTop } from "@/components/ScrollToTop"

export const metadata: Metadata = {
  title: "Politica de Confidențialitate | UN:EVENT",
  description:
    "Politica de confidențialitate UN:EVENT - Aflați cum colectăm, folosim și protejăm datele dumneavoastră personale conform GDPR.",
}

export default function PoliticaDeConfidentialitatePage() {
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm mb-6 sm:mb-8">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <FaHouse className="w-4 h-4" />
            </Link>
            <FaChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground">Politica de Confidențialitate</span>
          </nav>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-12 text-balance">
            Politica de Confidențialitate — UN:EVENT
          </h1>

          {/* Main Content Container */}
          <div className="glass-card p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Version Info */}
            <p className="text-sm text-muted-foreground">Versiunea 1.0 – actualizat la 12 septembrie 2025</p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">1) Cine suntem</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platforma UN:EVENT (unevent.ro) este administrată de:
              </p>

              {/* Company Info Box */}
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4 sm:p-6 space-y-2">
                <p className="font-semibold">SC PIXEL FACTORY SRL</p>
                <p className="text-sm text-muted-foreground">CUI: 47452355 / Reg. Com.: J35/154/2023</p>
                <p className="text-sm text-muted-foreground">Sediul social: Str. Bega, nr. 47, Ghiroda, Timiș</p>
                <p className="text-sm text-muted-foreground">
                  E-mail:{" "}
                  <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                    contact@unevent.ro
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Formular de contact:{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    pagina /contact
                  </Link>
                </p>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                SC PIXEL FACTORY SRL este operator de date în sensul Regulamentului (UE) 2016/679 („GDPR") pentru
                prelucrările realizate prin Platformă.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">2) Ce acoperă acest document</h2>
              <p className="text-muted-foreground leading-relaxed">
                Această Politică explică ce date colectăm, de ce, cum le folosim, când le divulgăm, cât le păstrăm, ce
                drepturi aveți și cum le exercitați.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Politica se aplică tuturor utilizatorilor Platformei (vizitatori, conturi,
                Listeri/Organizatori/Prestatori/Gazde și Clienți finali). Pentru modulele cookie, consultați{" "}
                <Link href="/politica-cookie" className="text-primary hover:underline">
                  /politica-cookie/
                </Link>
                . Folosirea Platformei implică și acceptarea{" "}
                <Link href="/termeni-si-conditii" className="text-primary hover:underline">
                  Termenilor și Condițiilor
                </Link>
                .
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">3) Ce date colectăm</h2>

              {/* 3.1 Direct Data */}
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold">3.1. Date furnizate direct de dvs.</h3>
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Date cont:</strong> nume, prenume, e-mail, telefon, parolă (hash-uită), avatar/foto.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Profil Lister/Organizator/Prestator:</strong> denumire comercială, CUI/VAT, nr. registru
                      comerț, sediu, site, descrieri, portofoliu, tarife, disponibilitate, adrese de locații.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Conținut listări:</strong> texte, fotografii/video, hărți/adrese, date de contact pentru
                      listare, reguli interne, capacitate, facilități.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Comunicare:</strong> mesaje trimise prin mesageria internă sau formulare.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Marketing:</strong> preferințe de comunicare, opțiuni newsletter.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Plăți pentru servicii ale Platformei (promovare/abonamente/comisioane):</strong> nume,
                      e-mail, adresă de facturare, date fiscale; nu stocăm datele cardului (sunt procesate de
                      procesatori terți).
                    </span>
                  </li>
                </ul>
              </div>

              {/* 3.2 Automatic Data */}
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold">3.2. Date colectate automat</h3>
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Date tehnice/log-uri:</strong> IP, tip dispozitiv/browser, sistem de operare, setări
                      limbă, pagini vizitate, timpi de răspuns, identificatori online, evenimente tehnice (erori,
                      crash).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Geolocalizare aproximativă:</strong> derivată din IP (pentru relevanță în rezultate, ex.:
                      oraș).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    <span>
                      <strong>Cookies și tehnologii similare:</strong> vezi{" "}
                      <Link href="/politica-cookie" className="text-primary hover:underline">
                        /politica-cookie/
                      </Link>
                      .
                    </span>
                  </li>
                </ul>
              </div>

              {/* 3.3 KYC - Highlighted */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6 space-y-3">
                <h3 className="text-lg sm:text-xl font-semibold text-yellow-600 dark:text-yellow-400">
                  3.3. Verificarea identității și a legitimității (KYC „light")
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  În situații justificate de securitatea Platformei, prevenirea fraudei, validarea calității de
                  reprezentant al unei companii sau pentru gestionarea cererilor privind drepturile GDPR, putem solicita
                  date/documente justificative, precum:
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6 text-sm sm:text-base">
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      <strong>Carte de identitate</strong> (strict pentru verificare identitate a persoanei
                      fizice/reprezentantului; vom solicita acoperirea/redactarea datelor sensibile (ex.: CNP/număr
                      CI/serie) atunci când nu sunt strict necesare).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      <strong>Dovezi privind administrarea unei companii:</strong> extras ONRC/registru, împuternicire,
                      act de numire, documente fiscale de bază (fără elemente sensibile inutile).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      Putem utiliza alternativ verificări prin interogarea registrelor publice (ex.: ONRC), prin
                      declarații pe proprie răspundere sau verificări video/poză live, pentru a minimiza copia
                      documentelor.
                    </span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Principiul minimizării:</strong> solicităm și păstrăm doar ceea ce este strict necesar
                  scopului (de regulă, nu păstrăm copii ale actelor; dacă păstrarea este necesară, o facem pe durate
                  scurte și limitate, cu acces restricționat).
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">4) Scopuri și temeiuri legale</h2>
              <p className="text-muted-foreground leading-relaxed">
                Prelucrăm datele dvs. în următoarele scopuri și în temeiul:
              </p>
              <ul className="space-y-3 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>
                      Creare și administrare cont; furnizare funcționalități (listări, profil, mesagerie, recenzii,
                      moderare):
                    </strong>{" "}
                    art. 6(1)(b) – executarea contractului; art. 6(1)(f) – interes legitim (asigurarea funcționării și
                    securității).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>
                      Publicare listări și promovare (servicii, locații, evenimente); management abonamente/comisioane:
                    </strong>{" "}
                    art. 6(1)(b) și 6(1)(f).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>
                      Comunicare (răspuns solicitări, suport, notificări operaționale, alerte de moderare/fraudă):
                    </strong>{" "}
                    art. 6(1)(b) și 6(1)(f).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <div className="space-y-2">
                    <p>
                      <strong>
                        Marketing (newsletter, oferte, invitații la evenimente, remarketing prin cookie-uri):
                      </strong>
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2">
                        <span className="text-primary mt-1.5">◦</span>
                        <span>prin e-mail/SMS/push: art. 6(1)(a) – consimțământ;</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary mt-1.5">◦</span>
                        <span>
                          pentru clienți existenți – unde legislația permite comunicări similare: art. 6(1)(f) – interes
                          legitim; vă puteți opune/dezabona oricând.
                        </span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Analiză și îmbunătățire produs (statistici agregate, UX, măsurare campanii):</strong> art.
                    6(1)(f).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Securitate, prevenirea abuzurilor și fraudei, verificări identitate/reprezentare:</strong>{" "}
                    art. 6(1)(f); dacă un cadru legal impune reținerea unor copii/date: art. 6(1)(c) – obligație legală.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Îndeplinirea obligațiilor legale (contabilitate, fiscalitate, răspuns autorități):</strong>{" "}
                    art. 6(1)(c).
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Gestionarea cererilor GDPR:</strong> art. 6(1)(c) și 6(1)(f).
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Nu luăm decizii exclusiv automate care produc efecte juridice similare pentru dvs. Putem realiza
                profilare limitată (de ex. personalizare rezultate/promovări) – vă puteți opune profilării pentru
                marketing.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">5) Cui divulgăm datele (împrumutați/împuterniciți)</h2>
              <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Furnizori IT & găzduire, mentenanță, securitate, back-up, e-mail/SMS/push.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Procesatori de plăți (ex.: Stripe/Netopia): primesc doar datele necesare procesării.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Servicii de analiză/marketing (ex.: Google Analytics, platforme publicitare) – pe baza
                    consimțământului pentru cookie-uri de marketing.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Servicii de verificare identitate sau consultare registre publice, dacă sunt utilizate.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Consultanți (juridic, contabilitate, audit), asigurători, recuperare creanțe, unde este cazul.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Autorități publice sau instanțe, când legea ne obligă ori pentru apărarea drepturilor noastre.
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Toți împuterniciții noștri prelucrează datele conform instrucțiunilor și cu garanții adecvate GDPR.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">6) Transferuri în afara SEE</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dacă transferăm date în afara Spațiului Economic European (ex.: către furnizori din SUA), o facem cu
                garanții legale adecvate (ex.: EU–US Data Privacy Framework, Clauze Contractuale Standard, măsuri
                suplimentare tehnice/organizaționale). Detalii la cerere:{" "}
                <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                  contact@unevent.ro
                </a>
                .
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">7) Cât timp păstrăm datele</h2>
              <p className="text-muted-foreground leading-relaxed">
                Aplicăm principii de limitare a stocării și minimizare:
              </p>
              <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Date cont & profil:</strong> pe durata existenței contului + 3 ani (prescripție) pentru
                    apărarea drepturilor.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Documente de verificare identitate/reprezentare:</strong> pe cât posibil fără stocare; dacă
                    e necesară păstrarea, max. 12 luni (sau cât impune legea), cu acces restricționat.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Date tranzacționale/fiscale:</strong> conform legislației – de regulă 10 ani.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Mesaje interne:</strong> de regulă 24 luni, excepțional mai mult pentru
                    investigații/obligații legale.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Log-uri tehnice:</strong> între 3–12 luni, în funcție de scop.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    <strong>Marketing:</strong> până la revocarea consimțământului/dezabonare sau după perioade de
                    inactivitate rezonabile.
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                La expirarea termenelor, datele sunt șterse ori anonimizate.
              </p>
            </section>

            {/* Section 8 - Security Highlighted */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">8) Securitate</h2>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 sm:p-6 space-y-3">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Aplicăm măsuri tehnice și organizatorice adecvate: control acces, criptare în tranzit, segregare
                  medii, back-up, audit și jurnalizare, politici interne, training personal.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Nicio platformă online nu poate garanta securitate absolută; în caz de incident de securitate cu risc
                  ridicat, vom notifica ANSPDCP și/sau persoanele vizate conform GDPR.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">9) Copii și minori</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platforma se adresează persoanelor de minimum 18 ani. Nu colectăm conștient date despre minori. Dacă ați
                identificat o utilizare necorespunzătoare, scrieți-ne la{" "}
                <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                  contact@unevent.ro
                </a>
                .
              </p>
            </section>

            {/* Section 10 - GDPR Rights Highlighted */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">10) Drepturile dvs. GDPR</h2>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 sm:p-6 space-y-4">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Aveți următoarele drepturi (în condițiile legii):
                </p>
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6 text-sm sm:text-base">
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Acces</strong> la datele dvs.;
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Rectificare</strong> a datelor inexacte;
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Ștergere</strong> („dreptul de a fi uitat") – când se aplică;
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Restricționare</strong> a prelucrării;
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Portabilitate</strong> (pentru datele prelucrate automat, în temeiul
                      consimțământului/contractului);
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Opoziție</strong> la prelucrări bazate pe interes legitim (inclusiv la profilarea pentru
                      marketing);
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      <strong>Retragerea consimțământului</strong> (nu afectează legalitatea prelucrărilor anterioare
                      retragerii);
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                    <span>
                      A nu fi supus(ă) unei <strong>decizii exclusiv automate</strong> cu efecte juridice similare.
                    </span>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Pentru exercitare: trimiteți o cerere la{" "}
                  <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                    contact@unevent.ro
                  </a>
                  .
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Pentru protejarea datelor, vă putem cere verificarea identității (cu minimizare: preferăm metode
                  alternative, iar dacă solicităm documente, vă rugăm să redactați elementele ne-necesare). Vom răspunde
                  în max. 30 de zile (prelungibil în cazuri complexe).
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <h3 className="text-lg sm:text-xl font-semibold">Plângeri</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Aveți dreptul să depuneți o plângere la ANSPDCP (
                  <a
                    href="https://www.dataprotection.ro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    www.dataprotection.ro
                  </a>
                  ). Vă încurajăm să ne contactați mai întâi pentru a încerca o soluționare amiabilă.
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">11) Conținut public, recenzii, mesagerie și moderare</h2>
              <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Listările și profilurile publice (texte, fotografii, video, adrese aproximative, prețuri,
                    disponibilitate) pot fi vizibile public și indexate de motoare de căutare.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>Recenziile pot rămâne publice; Platforma poate modera conținutul ilegal/abuziv.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Mesajele interne sunt private între părți, dar pot fi accesate de echipa noastră strict pentru
                    motive de securitate, prevenirea fraudei, soluționarea disputelor sau obligații legale.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">12) Marketing și comunicări comerciale</h2>
              <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6">
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Vă putem transmite newslettere și mesaje comerciale doar cu consimțământ sau, după caz, în baza
                    interesului legitim pentru clienți existenți, în limitele legii.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Vă puteți dezabona oricând (link în e-mail) sau prin cerere la{" "}
                    <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                      contact@unevent.ro
                    </a>
                    .
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span>
                    Pentru remarketing/ads folosim cookie-uri/ID-uri online numai cu consimțământ (detalii în{" "}
                    <Link href="/politica-cookie" className="text-primary hover:underline">
                      /politica-cookie/
                    </Link>
                    ).
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 13 - Identity Verification Highlighted */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                13) Verificări identitate & documente (clarificări importante)
              </h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 sm:p-6 space-y-3">
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6 text-sm sm:text-base">
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      Solicitarea unei poze live sau a unei copii a unui act de identitate ori dovada reprezentării
                      legale se face numai când este necesar (ex.: suspiciuni de fraudă, dispute serioase, sume
                      importante, listări sensibile, cereri GDPR).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      Preferăm metode alternative (verificări ONRC, declarații, apel video, documente redactate).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      Dacă stocăm temporar copii/documente, o facem pe termen minim, într-un spațiu cu acces
                      restricționat, și le ștergem imediat ce scopul încetează.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>Nu folosim aceste documente în scopuri de marketing.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-1.5">•</span>
                    <span>
                      Accesul este limitat la personalul strict necesar și, dacă e cazul, la împuterniciți cu obligații
                      de confidențialitate.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 14 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">14) Linkuri și autentificare prin terți</h2>
              <p className="text-muted-foreground leading-relaxed">
                Platforma poate conține linkuri către site-uri terțe și/sau autentificare prin terți (ex.: Google).
                Prelucrările efectuate de acești terți se supun propriilor politici; vă rugăm să le citiți.
              </p>
            </section>

            {/* Section 15 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">15) Modificări ale Politicii</h2>
              <p className="text-muted-foreground leading-relaxed">
                Putem actualiza această Politică pentru a reflecta schimbări legislative sau operaționale. Versiunea
                curentă și data actualizării sunt afișate în header. Continuarea folosirii Platformei după publicare
                înseamnă acceptarea modificărilor.
              </p>
            </section>

            {/* Section 16 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">16) Contact & responsabilități</h2>
              <p className="text-muted-foreground leading-relaxed">
                Întrebări privind protecția datelor sau exercitarea drepturilor:
              </p>
              <div className="bg-muted/30 border border-border/50 rounded-lg p-4 sm:p-6 space-y-2">
                <p className="text-sm text-muted-foreground">
                  E-mail:{" "}
                  <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                    contact@unevent.ro
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Formular:{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    /contact
                  </Link>
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                (În prezent nu avem obligativitatea numirii unui DPO; la schimbare, vom actualiza Politica.)
              </p>
            </section>

            {/* Summary Box */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold">Rezumat pe scurt (nu înlocuiește textul de mai sus)</h2>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 sm:p-6 space-y-3">
                <ul className="space-y-2 text-muted-foreground leading-relaxed ml-4 sm:ml-6 text-sm sm:text-base">
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span>
                      Colectăm date pentru: cont, listări, mesagerie, plăți, securitate, suport, marketing (cu
                      consimțământ).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span>
                      Putem solicita ID sau dovezi de reprezentare doar dacă e necesar, preferând alternative, cu
                      minimizare și termene scurte de păstrare.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span>
                      Nu vindem datele; colaborăm cu furnizori (IT, plăți, e-mail, analytics) sub garanții GDPR.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span>
                      Aveți drepturi extinse (acces, rectificare, ștergere, opoziție, portabilitate, retragere
                      consimțământ).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                    <span>
                      Ne puteți scrie oricând la{" "}
                      <a href="mailto:contact@unevent.ro" className="text-primary hover:underline">
                        contact@unevent.ro
                      </a>
                      .
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
