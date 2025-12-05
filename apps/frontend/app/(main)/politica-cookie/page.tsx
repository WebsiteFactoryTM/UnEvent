import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaHouse } from "react-icons/fa6";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieDetectionTable } from "@/components/common/CookieDetectionTable";

export const metadata: Metadata = {
  title: "Politica de Cookie | UN:EVENT",
  description:
    "Politica de utilizare a cookie-urilor pe platforma UN:EVENT. Informații despre tipurile de cookie-uri folosite, scopurile acestora și cum le puteți gestiona.",
};

export default function PoliticaCookiePage() {
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
            <span className="text-foreground">Politica de Cookie</span>
          </nav>

          {/* Main Content */}
          <article className="p-4 sm:p-6 lg:p-8 space-y-6 md:space-y-8">
            <header className="space-y-4 border-b border-border pb-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Politica de Cookie — UN:EVENT
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
                  1) Cine suntem și ce acoperă acest document
                </h2>
                <p>
                  Platforma UN:EVENT (unevent.ro) este administrată de SC PIXEL
                  FACTORY SRL. Această Politică explică modul în care folosim
                  cookie-uri și tehnologii similare (ex. localStorage, SDK-uri,
                  pixeli, web beacons) pe site și în aplicație.
                </p>
                <p>
                  Pentru informații despre prelucrarea datelor personale, vedeți{" "}
                  <Link
                    href="/politica-de-confidentialitate"
                    className="text-primary hover:underline"
                  >
                    Politica de confidențialitate
                  </Link>{" "}
                  și{" "}
                  <Link
                    href="/termeni-si-conditii"
                    className="text-primary hover:underline"
                  >
                    Termeni și condiții
                  </Link>
                  .
                </p>
                <p>
                  În UE/SEE folosim cookie-uri necesare fără consimțământ și
                  solicităm consimțământul dvs. prealabil pentru cookie-uri de
                  preferințe, statistici/analitice și marketing (conform GDPR și
                  normelor ePrivacy).
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  2) Ce sunt cookie-urile și tehnologiile similare
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Cookie-urile</strong> sunt fișiere text mici plasate
                    pe dispozitivul dvs. pentru a permite funcții
                    (autentificare, securitate), a reține preferințe (limbă,
                    oraș), a măsura utilizarea (analitice) sau a personaliza
                    reclame (marketing).
                  </li>
                  <li>
                    <strong>LocalStorage/SessionStorage</strong> stochează local
                    setări/app state (ex.: oraș selectat, starea
                    consimțământului).
                  </li>
                  <li>
                    <strong>Pixeli/web beacons/SDK-uri</strong> sunt fragmente
                    de cod folosite pentru măsurare și marketing (ex.: Meta
                    Pixel, TikTok Events).
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  3) Cum folosim cookie-urile (categorii)
                </h2>

                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                      1. Strict necesare (fără consimțământ)
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/90">
                      Asigură funcționarea de bază: autentificare, securitate,
                      anti-fraudă, încărcare pagini, gestionare consimțământ.
                    </p>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                      2. Preferințe (necesită consimțământ)
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/90">
                      Rețin opțiuni precum limbă, oraș, sortări, filtre.
                    </p>
                  </div>

                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                      3. Statistici/Analitice (necesită consimțământ)
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/90">
                      Măsoară traficul și performanța (ex.: Google Analytics).
                      Datele sunt agregate/anonimizate pe cât posibil.
                    </p>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3">
                      4. Marketing (necesită consimțământ)
                    </h3>
                    <p className="text-sm sm:text-base text-foreground/90">
                      Remarketing, măsurarea conversiilor și personalizarea
                      reclamelor (ex.: Meta, TikTok).
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Geolocalizare aproximativă din IP:</strong> putem
                  deduce orașul pentru a vă afișa conținut relevant (ex.:
                  evenimente/locații din apropiere). Această deducere se poate
                  stoca în localStorage sau cookie de preferință (dacă
                  permiteți).
                </p>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  4) Baza legală și modul de obținere a consimțământului
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Strict necesare:</strong> interes legitim (art.
                    6(1)(f) GDPR).
                  </li>
                  <li>
                    <strong>Preferințe/Analitice/Marketing:</strong>{" "}
                    consimțământ (art. 6(1)(a) GDPR), obținut prin
                    bannerul/caseta de Setări cookie.
                  </li>
                  <li>
                    Vă puteți retrage sau modifica opțiunile oricând din „Setări
                    cookie" (link persistent în footer sau în pictograma cookie
                    de pe site).
                  </li>
                  <li>
                    Stocăm o dovadă a consimțământului (versiune, dată/ora,
                    categorii alese) pentru conformitate.
                  </li>
                </ul>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  5) Ce cookie-uri folosim
                </h2>
                <p className="text-sm text-muted-foreground">
                  Lista de mai jos afișează cookie-urile detectate în timp real
                  în browserul dvs. Cookie-urile active sunt marcate cu un
                  indicator verde.
                </p>

                <CookieDetectionTable />
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  6) Cookie-uri plasate de terți (third-party)
                </h2>
                <p>
                  Unele module aparțin terților (ex.: Google, Meta, TikTok,
                  eventual Hotjar). Aceștia pot folosi cookie-urile și pentru
                  propriile scopuri (în limitele politicilor lor). Vă recomandăm
                  să consultați politicile publice ale acestor furnizori.
                  Activăm terții numai dacă acordați consimțământul pentru
                  categoriile aferente.
                </p>
              </section>

              {/* Section 7 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  7) Controlul asupra cookie-urilor
                </h2>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 sm:p-6 space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Cum vă gestionați preferințele
                  </h3>
                  <ul className="space-y-2 text-sm sm:text-base text-foreground/90">
                    <li className="flex gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        <strong>Setări cookie (recomandat):</strong> folosiți
                        linkul „Setări cookie" disponibil permanent în site
                        pentru a accepta/respinge granular categoriile.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        <strong>Browser:</strong> puteți șterge/bloca cookie-uri
                        din setările browserului. Atenție: blocarea
                        cookie-urilor necesare poate afecta funcționarea
                        site-ului (login, coș, formulare, etc.).
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        <strong>Preferințe publicitate:</strong> platforme
                        precum YourOnlineChoices/EDAA, NAI, DAA permit
                        gestionarea preferințelor de publicitate comportamentală
                        la nivel de browser.
                      </span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 8 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  8) Durată de stocare
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Sesiune:</strong> se șterg când închideți browserul.
                  </li>
                  <li>
                    <strong>Persistente:</strong> rămân pe dispozitiv până la
                    expirare sau ștergere manuală (de obicei 1–24 luni, în
                    funcție de scop).
                  </li>
                  <li>
                    Duratele concrete pentru fiecare cookie activ sunt
                    prezentate în banner sau în tabelul din această pagină, dacă
                    este generat automat.
                  </li>
                </ul>
              </section>

              {/* Section 9 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  9) LocalStorage, IP și alte tehnologii
                </h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    Putem salva în localStorage preferințe precum oraș, limbă,
                    filtre pentru a îmbunătăți experiența.
                  </li>
                  <li>
                    Orașul aproximativ dedus din IP poate fi folosit pentru a
                    pre-selecta conținut local. Nu păstrăm istoricul IP în scop
                    de marketing fără consimțământ.
                  </li>
                  <li>
                    Evenimentele de tracking (ex.: AddToCart, Lead) se trimit
                    numai dacă ați optat pentru categoriile relevante
                    (Analitice/Marketing).
                  </li>
                </ul>
              </section>

              {/* Section 10 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  10) Verificări identitate (KYC „light") și cookie-uri
                </h2>
                <p>
                  Dacă activăm fluxuri de verificare identitate/reprezentare
                  (ex.: pentru listeri), acestea pot utiliza cookie-uri necesare
                  pentru sesiune/securitate și, după caz, tehnologii terțe de
                  verificare (doar dacă sunt inițiate de dvs.). Nu folosim
                  aceste date în scop de marketing. Detaliile despre datele
                  personale sunt în{" "}
                  <Link
                    href="/politica-de-confidentialitate"
                    className="text-primary hover:underline"
                  >
                    Politica de confidențialitate
                  </Link>
                  .
                </p>
              </section>

              {/* Section 11 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  11) Transferuri în afara SEE
                </h2>
                <p>
                  Dacă activăm servicii ale unor furnizori din afara SEE,
                  transferul se realizează în baza mecanismelor legale (ex.:
                  EU–US Data Privacy Framework, Clauze Contractuale Standard) și
                  a măsurilor tehnice/organizatorice adecvate.
                </p>
              </section>

              {/* Section 12 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  12) Actualizări ale Politicii de Cookie
                </h2>
                <p>
                  Putem actualiza această Politică pentru a reflecta modificări
                  operaționale, tehnice sau legale. Vom publica versiunea
                  curentă și data. Continuarea utilizării site-ului după
                  publicare înseamnă acceptarea modificărilor (cu excepția
                  cazului în care legea cere reconfirmarea consimțământului).
                </p>
              </section>

              {/* Section 13 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  13) Contact
                </h2>
                <p>Întrebări despre cookie-uri sau preferințele dvs.:</p>
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
                </ul>
              </section>

              {/* Section 14 */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                  14) Rezumat rapid (nu înlocuiește textul de mai sus)
                </h2>
                <div className="bg-muted/30 border border-border/50 rounded-lg p-4 sm:p-6 space-y-3 text-sm sm:text-base">
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      Folosim cookie-uri necesare (fără consimțământ) și
                      cookie-uri de preferințe/analitice/marketing (cu
                      consimțământ).
                    </li>
                    <li>
                      Vă puteți gestiona opțiunile în „Setări cookie" oricând.
                    </li>
                    <li>
                      Lista exactă de cookie-uri active este afișată în banner
                      și poate diferi de exemplele de aici.
                    </li>
                    <li>
                      Pentru date personale și drepturile dvs., consultați{" "}
                      <Link
                        href="/politica-de-confidentialitate"
                        className="text-primary hover:underline"
                      >
                        Politica de confidențialitate
                      </Link>
                      .
                    </li>
                  </ul>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
              <p>
                Prin utilizarea platformei UN:EVENT, confirmați că ați citit și
                înțeles această Politică de Cookie.
              </p>
              <p className="mt-2">Ultima actualizare: 12 septembrie 2025</p>
            </footer>
          </article>
        </div>
      </div>
    </>
  );
}
