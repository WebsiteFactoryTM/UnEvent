**UN:EVENT — Organizare conținut (fără modificări de text)**

**1\) Descriere & Scop**

**UN:EVENT**  
**Scop Platforma:** centralizarea locatiilor si a serviciilor dedicate oricarui tip de eveniment din Romania

**Utilitate pentru client final:** simplificarea procesului de cautare, research si contactare a celor listati pe platforma \+ gasire evenimente viitoare din orasele din Romania \- totul intr-un singur log.

**Utilitate pentru afacerile listate:** simplitate si gratuitate in listarea locatiilor, a serviciilor si a evenimentelor intr-un mediu/ecosistem dedicat pentru cei interesati sa organizeze evenimente. Fiecare listare \= pagina de prezentare dedicata a listarii cu Foto principala, galerie foto, Titlu, Descriere, Capacitate maxima persoane, Adresa si Oras, Facilitati selectabile presetate, link-uri website si social media, localizare pe harta, date de contact, Mesagerie directa.

**Important de luat in considerare pentru Social Media marketing → vezi doc [UN\_EVENT\_Tech\_Checklist\_Ads](https://docs.google.com/document/d/12pNUCmNHdHu8Qe7Lsml_AsHUgLQ2Qu_7ZAdYTDKkqSs/edit?usp=sharing)**

**Important de luat in considerare pentru SEO & Sitemap → [UNEVENT-SEO-Blueprint.docx](https://docs.google.com/document/d/1ksU9JvjRrmr4yCLBWj-on97V6e53_KJl/edit?usp=drive_link&ouid=104914397764180630154&rtpof=true&sd=true)**

**Important: Listele extensive de import pentru Tip locatii, Tip evenimente, facilitati, Tip servicii se regasesc in Drive / Folder [Dev Plan](https://drive.google.com/drive/folders/1CSrvFOBABwuaBBHXyZB7-Q5DCLNhRlO2?usp=drive_link)**

---

**2\) În viitor**

* Recomandare automata servicii pentru cautari locatii intr-un anumit oras, recomandare automata locatii pentru cautari servicii intr-un anumit oras \- dintre cele setate de admin ca recomandate (linked by tag-uri tipuri de evenimente si oras)  
* Formulare comanda specifice pentru categorii de evenimente cu creare solicitare oferta in piata pe servicii si locatii  
* Ghid / agenda utilizatorului \- pentru a simplifica organizarea unui eveniment (nunta, petrecere, workshop, galerie de arta, prezentare produse, showroom, etc)  
* Abonamente  
* Promovare listare

---

**3\) Style**

**Glasmorphism / rounded corners \- Black and White / Light \- Dark Mode \- System auto /**

**UN:EVENT \- Pre-launch landing page styling**

**“**DESIGN SYSTEM REQUIREMENTS:

🌓 THEME & MODE  
\- Implement automatic light/dark mode system detection using prefers-color-scheme  
\- Primary theme: Dark mode with black backgrounds (oklch(0.145 0 0))  
\- Light mode: White backgrounds with inverted contrasts (oklch(1 0 0))  
\- Use CSS custom properties for seamless theme switching

🎨 COLOR PALETTE  
Primary Background Colors:  
\- Dark: Pure black (\#000000) or near-black (oklch(0.145 0 0))  
\- Use Romanian flag accent colors as highlights:  
  \* Blue: \#002b7f (rgb(0, 43, 127))  
  \* Yellow: \#fcd116 (rgb(252, 209, 22))  
  \* Red: \#ce1126 (rgb(206, 17, 38))

Glassmorphism Colors:  
\- White overlays with opacity: bg-white/5, bg-white/10, bg-white/20  
\- Black overlays with opacity: bg-black/80, bg-black/90, bg-black/95  
\- Border colors: border-white/10, border-white/20, border-white/30

Accent Colors (for icons, badges, highlights):  
\- Green: green-400/500 for success states  
\- Blue: blue-400/500 for information  
\- Purple: purple-400/500 for features  
\- Yellow: yellow-400/500 for highlights  
\- Cyan: cyan-400/500 for interactions  
\- Pink: pink-400/500 for community

🔮 GLASSMORPHISM EFFECTS (Core Design Language)  
Feature Cards (.feature-card):  
\- background: rgba(255, 255, 255, 0.05)  
\- backdrop-filter: blur(20px)  
\- border: 1px solid rgba(255, 255, 255, 0.1)  
\- Hover: bg-white/8, border-white/20  
\- Box shadow: multi-layer (0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1))  
\- Smooth transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1\)

Navigation/Buttons (glassmorphism style):  
\- background: rgba(255, 255, 255, 0.1)  
\- backdrop-filter: blur(15px)  
\- border: 1px solid rgba(255, 255, 255, 0.2)  
\- Hover effects: scale(1.05), increased glow

Form Inputs:  
\- Semi-transparent backgrounds with backdrop blur  
\- White borders with 10-20% opacity  
\- Glow effects on focus: 0 0 20px rgba(255,255,255,0.2)

✨ ANIMATED ELEMENTS  
Background Orbs/Bubbles:  
\- Large blurred circles using Romanian flag colors  
\- Radial gradients with transparency  
\- Floating animation (20-32s duration, infinite)  
\- Positioned absolutely with blur(30px) filter  
\- Movement: translate \+ scale transformations

Entrance Animations:  
\- fadeInUp: opacity 0→1 \+ translateY(30px→0)  
\- Staggered delays: 0s, 0.2s, 0.4s, 0.6s  
\- Duration: 0.8s ease-out  
\- Use animate-fade-in-up, animate-fade-in-up-delay-200, etc.

Hover States:  
\- Scale: hover:scale-105 or hover:scale-110  
\- Smooth transitions: transition-all duration-300  
\- Glow intensification on hover  
\- Border color/opacity changes

🔤 TYPOGRAPHY  
Font Family:  
\- Primary: Manrope (Google Font)  
\- Variable font with weight range  
\- font-sans, antialiased

Headings:  
\- H1: text-3xl md:text-5xl lg:text-6xl, font-bold  
\- H2: text-4xl md:text-5xl, font-bold  
\- H3: text-xl md:text-2xl, font-bold  
\- Color: text-white for dark backgrounds  
\- Leading: leading-tight for headlines

Body Text:  
\- Base: text-base or text-lg  
\- Muted: text-white/70, text-white/80  
\- Micro-copy: text-sm text-white/60  
\- Leading: leading-relaxed for paragraphs

📐 SPACING & LAYOUT  
Container Widths:  
\- max-w-4xl, max-w-5xl, max-w-6xl, max-w-7xl  
\- Always centered: mx-auto  
\- Horizontal padding: px-4

Section Spacing:  
\- py-20 (standard section padding)  
\- space-y-8 md:space-y-12 (responsive vertical rhythm)  
\- gap-6 md:gap-8 (grid/flex gaps)

Border Radius:  
\- Small: rounded-lg (8px)  
\- Medium: rounded-xl (12px)  
\- Large: rounded-2xl (16px)  
\- Circular: rounded-full

🎯 COMPONENT PATTERNS  
Cards:  
\- Use .feature-card base class  
\- Padding: p-6 md:p-8 md:p-12  
\- Hover: hover:scale-105 transition-transform duration-300  
\- Always include backdrop-blur-xl

Buttons Primary:  
\- bg-white text-black (CTA buttons)  
\- hover:bg-white/90  
\- px-6 py-3 or px-8 py-6  
\- rounded-lg or rounded-xl  
\- font-semibold  
\- shadow-xl with glow on hover

Buttons Secondary:  
\- bg-black text-white with border border-white  
\- Glassmorphism effect with backdrop-blur  
\- Pulsing glow animation (2s infinite)

Icons:  
\- Size: w-5 h-5, w-6 h-6, w-7 h-7  
\- In colored circles: rounded-full bg-{color}-500/20 border border-{color}-500/30  
\- Color classes: text-{color}-400

Navigation:  
\- Fixed header: fixed top-0 z-50  
\- bg-black/80 backdrop-blur-xl  
\- border-b border-white/10  
\- Mobile menu: Portal-based full-screen overlay with z-\[90+\]

🎪 INTERACTIVE ELEMENTS  
Tabs:  
\- Glassmorphism container with backdrop-blur  
\- Active tab: bg-white text-black  
\- Inactive: text-white/70 hover:bg-white/10

Accordion:  
\- Glassmorphism cards  
\- Smooth height transitions  
\- ChevronDown icon rotation on expand

Carousel:  
\- Dot indicators with glassmorphism  
\- Navigation buttons with circular design  
\- Smooth slide transitions (duration-500)

🌊 PARALLAX & MOTION  
Background Effects:  
\- Animated bubbles with float animation  
\- Multiple layers with different animation speeds  
\- Blur effects for depth  
\- opacity: 0.6, filter: blur(30px)

Scroll Behavior:  
\- @media (prefers-reduced-motion: no-preference) { scroll-behavior: smooth }  
\- Respect user motion preferences  
\- IntersectionObserver for on-scroll reveals

Performance:  
\- will-change: transform, opacity (on animated elements)  
\- Use transform/opacity for animations (not width/height)  
\- Smooth 60fps animations

📱 RESPONSIVE DESIGN  
Breakpoints:  
\- Mobile-first approach  
\- sm: 640px, md: 768px, lg: 1024px, xl: 1280px  
\- Hide/show: hidden md:block, lg:flex  
\- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

Mobile Specific:  
\- Larger touch targets (min 44x44px)  
\- Hamburger menu with portal overlay  
\- Swipe gestures for carousels  
\- Reduced motion and smaller fonts

♿ ACCESSIBILITY  
Focus States:  
\- focus-visible:ring-2 focus-visible:ring-white/20  
\- Clear keyboard navigation  
\- outline-ring/50 on all elements

ARIA:  
\- aria-label on icon buttons  
\- aria-expanded for toggles  
\- role="tablist" for tabs  
\- Semantic HTML5 elements

Color Contrast:  
\- WCAG AA compliant  
\- Text on dark: white, white/90, white/80  
\- Borders visible: white/10, white/20

🛠 TECHNICAL REQUIREMENTS  
\- Next.js 15+ with App Router  
\- TypeScript strict mode  
\- Tailwind CSS 4+ with @theme inline  
\- React 19+ with client components where needed  
\- CSS custom properties for theming  
\- Mobile portal pattern for overlays (createPortal)

📋 COMPONENT CHECKLIST  
When building any component, include:  
✓ Glassmorphism background \+ backdrop-blur  
✓ Smooth transitions (0.3s cubic-bezier)  
✓ Hover states with scale/glow  
✓ Responsive sizing (mobile → desktop)  
✓ Proper spacing (p-6 md:p-8)  
✓ Border radius (rounded-xl, rounded-2xl)  
✓ White text with opacity variants  
✓ Romanian flag color accents where appropriate  
✓ Entrance animations (fadeInUp patterns)  
✓ Dark mode compatibility via CSS variables

🎭 VISUAL HIERARCHY  
1\. Primary CTAs: White button, bold, large, pulsing glow  
2\. Secondary actions: Glassmorphism with border  
3\. Content cards: Subtle glassmorphism, hover lift  
4\. Background: Pure black with floating orbs  
5\. Text: White with opacity for hierarchy (100% → 90% → 80% → 70% → 60%)

🌟 BRAND PERSONALITY  
\- Modern, premium, trustworthy  
\- Minimal yet warm  
\- Technology-forward but human  
\- Romanian-centric (flag colors as accents)  
\- Clean, uncluttered interfaces  
\- Smooth, delightful interactions

**“**

---

**4\) Homepage**

**4.1 Meta**

* **Meta Title:** Locații de nuntă, săli evenimente, DJ & catering | UN:EVENT  
* **Meta description:** Platformă pentru locații de nuntă, săli de evenimente, DJ, formații, catering și foto-video. Prețuri și contact direct în România. Listează gratuit.  
* **Meta keywords:** locații de nuntă,săli evenimente,DJ evenimente,trupă nuntă,catering evenimente,formații muzică,foto-video evenimente,închiriere spații,organizare evenimente,locații petreceri,săli conferințe,evenimente România

**4.2 Hero section**

* **Title:** Locații, evenimente și servicii în România  
* **Description:** Caută ce faci azi sau în weekend, rezervă spații pentru petreceri, nunți, workshop-uri și contactează rapid prestatori verificați (DJ, trupe, foto-video, catering, organizatori). Descoperă, compară și rezervă în câteva clicuri, în toată România.  
* **Filtre cu tab-uri:** Locatii, Evenimente, Servicii

**Sectiune Filtrare cu tab-uri**

**Tab Locatii tab:**

* Ce eveniment organizezi? (Cautare tip eveniment asociat listarii sub forma de tags)  
* Unde (Locatie \- Oras)  
* Tip Locatie  
* Avansate (reaveal) \- Capacitate: (persoane) Min-Max cu bara de setare interval capacitate si number fields / Pret? Interval preț locație (RON) Min-Max, bara de setare interval pret si number fields

**Servicii tab:**

* Ce serviciu cauti? (Categorii de servicii)  
* Unde? (locatie Oras)  
* Pentru ce tip de eveniment? (Event types tags asociate listarilor de servicii)

**Evenimente tab:**

* Ce tip de eveniment?  
* Unde?  
* Când? (orice data, astazi, maine, saptamana aceasta, saptamana viitoare, luna.. data specifica)

**Căutări (format URL exemplu):**

* /locatii?city=timisoara\&type=bar/

**Dropdowns:**

* selectare filtre scrolabile si cu optiune de Cautare in dropdown

**4.3 CTA Section**

**Ai o locație sau oferi servicii? Listează-te gratuit și fii găsit de organizatori**

* **Butoane:** Listeaza locatia / Listează-ti serviciile / Adauga eveniment  
* **Navigare:** Catre login sau daca e logat catre /profil tab specific \- in caz ca nu are user role specific, catre solicitare adaugare rol de gazda, organizator sau furnizor servicii

---

**5\) Secțiuni recomandate**

**5.1 Locatii recomandate section**

**Carousel** Card-uri cu locatiile setate de admin ca recomandate. Cardurile trebuie sa contina:

* foto principala a listarii   
* badge verificat (daca e verificat)  
* icon adauga la favorite  
* titlu listare (limita 80-100 caractere)  
* Descriere (limita de 210 caractere)  
* list cu icons \- locatie, capacitate, tip locatie  
* buton full width bottom **Vezi detalii** \- trimitere catre pagina dedicata a listarii  
* Medie Rating daca exista (nr recenzii) daca exista

**5.2 Servicii recomandate**

**Carousel** Card-uri cu listari servicii setate de admin ca recomandate. Cardurile trebuie sa contina:

* foto profil utilizator servicii  
* Nume setat de utiliator pentru serviciu (Ex: DJ Marian)  
* Badge Tip servicii  
* Badge Verificat (daca e verificat)  
* Icon star medie rating in paranteze nr recenzii)  
* Locatie icon cu Orasul  
* optiune icon adauga la favorite

**5.3 Evenimente populare**

**Carousel** Card-uri cu listari evenimente setate de admin ca recomandate. Cardurile trebuie sa contina:

* foto principala a listarii  
* badge verificat (daca e verificat)  
* icon adauga la favorite  
* titlu listare (limita 80-100 caractere)  
* Descriere (limita de 210 caractere)  
* list cu icons \- ziua (ex: miercuri) data (zi, luna, an), ora inceperii, Locatie (oras)  
* Medie Rating daca exista (nr recenzii) daca exista

---

**6\) Alte secțiuni**

* **Sectiune CTA „Câștigă un venit suplimentar”** \- La fel ca in aplicatia actual  
* **Sectiune About** \- La fel ca in aplicatia actual

---

**7\) Footer**

**Footer 4 colums**

1. **Logo \+ tagline** (Orice poveste incepe cu un loc) si **Urmareste-ne** \- lista icons (react-icons fa6) social media  
2. **Contact** List cu icons telefon, email, adresa  
3. **Utile** list cu icons pagini utile  
4. **List** cu icons Termeni si politici / Copyright footer si bannere anpc

# **Sign Up & Profile — Organizare conținut (fără modificări de text)**

## **1\) Sign Up & Profile**

* Autentifiacre & Logare Form

---

## **2\) Autentifiacre & Logare Form**

### **2.1 Autentifiacre**

* Autentifiacre \- email & parola \+ Google & Facebook Login

### **2.2 Înregistrare**

* Inregistrare \- Nume complet, Parola, Confirma parola, Selectare rol (Client \- Caut locatii, servicii si evenimente / Furnizor servicii \- Ofer servicii pentru evenimente / Organizator de evenimente \- Organizez si gestionez evenimente / Proprietar locatie \- Ofer spatii pentru evenimente) Checkbox Sunt de acord cu Politica de confidentialitate UN:EVENT & Sunt de acord cu Termeni si conditii UN:EVENT \+ Google & Facebook Signup (in cazul google facebook, aloca automat rol client)

---

## **3\) Profil / cont**

### **3.1 Info profil & verificare**

* Profil /cont \- Info profil cu posibilitate de editare date (profile foto, nume, email, telefon, website, biografie) / Optiune Verifica-ti contul (form solicitare "Nume complet si adresa" incarcare copie CI \+ bifa "Esti persoana juridica?" deschide in form completare date "Nume companie, CUI, Adresa sediu social, incarca copie CUI), checkboxes: Declar pe proprie raspundere ca datele declarate imi apartin etc, sunt de acord cu Politica de confidentialitate UN:EVENT \- trimite forular cu date catre admin care aproba sau respinge \- la aprobare se adauga bifa "verificat" pe cont si pe listarile asociate contului.

### **3.2 Roluri & permisiuni**

* / Sectiune Rolulri si permisiuni \- Vede rolul asociat (client, etc..) poate solicita asocierea altor roluri care deschide optiuniea de a lista in functie de rol

### **3.3 Securitate cont**

* / Optiune Schimba parola si Sterge contul

---

## **4\) Tab-uri în /cont**

* Tab-uri in /cont \= Locatiile mele, Serviciile mele, Evenimentele Mele, Mesaje, Favorite (pentru locatii, servicii, evenimente \- afisarea acestor sectiuni depinde de tipul / tipurile de rol asociate utilizatorului) / Abonamente (viitor)

---

## **5\) Locatiile mele**

### **5.1 Listare**

*   
  * lista locatii cu titlu, scurta descriere, Locatie (oras), data crearii, număr vizualizări listare, status (in asteptare, aprobat, respins) \- optiuni: editare, vezi, sterge

### **5.2 Adăugare locație**

*   
  * Buton Adauga locatie \-\> deschide formular de adaugare locatie

#### *Formular adaugare locatie (Popup)*

* Popup cu formular \-\> taburi: Informatii, Adresa, Facilitati, Imagini, Contact

**Tab Informatii**

* Titlul Locatie, Tip locatie (lista cu cautare \- ca in formular cautare), Destinata pentru (lista cu multiple choises \- adauga sub forma de tags Tipuri de evenimente), Descriere locatie, Capacitate maxima (persoane), Suprafata (m patrati), Pret (optional), bifa adauga pret pentru inchiriere \- deschide (dropdown) Facturare pe oro sau pe zi, Pret (RON)

**Tab Adresa**

* Selecteaza oras (dropdown cu cautare), Adresa completa (linked with google maps auto detect \- mapare geolocatie pentru harta \- ar trebui folosit si orasul pentru a avea mapare corecta), optiune de mapare manuala pe harta a pin-ului locatiei

**Tab Facilitati**

* Facilitati disponibilie (selecteaza facilitatile disponibile in locatie) \- Dropdown multichoice cu search \- mapare facilitati pe categorii (ex: Categorie Catering & Bar, facilitati de selectat Bar echipat, Bucatarie profesionala, Cuptoare / plite etc) \-

**Tab Imagini**

* Imagine principala \- upload 1 imagine max / Galerie foto \- Upload multiple images pentru galerie foto (max 10 foto) / Optiune de adaugare Link Youtube (max 3 link-uri)

**Specificații tehnice imagini:**

* Formate: JPG, PNG, WebP

* Comprimare automată la WebP ≤ 500KB

* Dimensiuni maxime: 1920×1920px

* Imaginile portret: afișaj pe fundal negru

* Text alternativ generat automat

**Tab Contact**

* Telefoane contact (max 2), email, website, Social media links (Field labes with icons)

**Final step \- thank you** 

* Dupa transmiterea formularului, ultima afisare a formularului trebuie sa fie un icon mare de checkbox round, “Datele au fost transmise cu succes / Listarea a fost transmisa catre aprobare \- vei primi un email cu confirmarea aprobarii listarii.

---

## **6\) Serviciile mele**

### **6.1 Listare**

*   
  * lista servicii cu titlu, scurta descriere, Locatie (oras), data crearii, număr vizualizări listare, status (in asteptare, aprobat, respins) \- optiuni: editare, vezi, sterge

### **6.2 Adăugare serviciu**

*   
  * Buton Adauga serviciu \-\> deschide formular de adaugare serviciu

#### *Formular adaugare serviciu (Popup)*

* Popup cu formular \-\> taburi: Informatii, Servicii, Adresa, Imagini, Contact

**Tab Informatii**

* Nume furnizor servicii, Destinat pentru (lista cu multiple choises \- adauga sub forma de tags Tipuri de evenimente), Descriere servicii, Pret (optional), bifa adauga pret pentru servicii \- deschide (dropdown) Facturare pe oro sau pe zi, Pret (RON)

**Tab Servicii**

* Dropdown multichoice cu search \- mapare servicii pe categorii si adaugare sub forma de tags (similar cu facilitati locatii)

**Tab Adresa**

* Selecteaza oras (dropdown cu cautare), Adresa completa (linked with google maps auto detect \- mapare geolocatie pentru harta \- ar trebui folosit si orasul pentru a avea mapare corecta), optiune de mapare manuala pe harta a pin-ului locatiei

**Tab Imagini**

* Imagine Profil \- upload 1 imagine max / Galerie foto \- Upload multiple images pentru galerie foto (max 10 foto) / Optiune de adaugare Link Youtube (max 3 link-uri)

**Specificații tehnice imagini:**

* Formate: JPG, PNG, WebP

* Comprimare automată la WebP ≤ 500KB

* Dimensiuni maxime: 1920×1920px

* Imaginile portret: afișaj pe fundal negru

* Text alternativ generat automat

**Tab Contact**

* Telefoane contact (max 2), email, website, Social media links (Field labes with icons)

**Final step \- thank you** 

* Dupa transmiterea formularului, ultima afisare a formularului trebuie sa fie un icon mare de checkbox round, “Datele au fost transmise cu succes / Listarea a fost transmisa catre aprobare \- vei primi un email cu confirmarea aprobarii listarii.

---

## **7\) Evenimentele Mele**

### **7.1 Listare**

*   
  * lista evenimente cu titlu, scurta descriere, Locatie (oras), data crearii, data incepere si finalizare, număr participanți, număr vizualizări listare, status (in asteptare, aprobat, respins, FINALIZAT) \- optiuni: editare, vezi, sterge

### **7.2 Adăugare eveniment**

* Popup cu formular \-\> taburi: Informatii, Adresa, Imagini, Program, Contact

**Tab Informatii**

* Titlu eveniment, Tip eveniment, Descriere eveniment, Pret bilet (optional), bifa adauga pret bilet \- deschide (dropdown) Pret (RON) sau Intrare libera

**Tab Adresa**

* Selecteaza oras (dropdown cu cautare), Adresa completa (linked with google maps auto detect \- mapare geolocatie pentru harta \- ar trebui folosit si orasul pentru a avea mapare corecta), optiune de mapare manuala pe harta a pin-ului locatiei

**Tab Imagini**

* Imagine principala \- upload 1 imagine max / Galerie foto \- Upload multiple images pentru galerie foto (max 10 foto) / Optiune de adaugare Link Youtube (max 3 link-uri)

**Specificații tehnice imagini:**

* Formate: JPG, PNG, WebP

* Comprimare automată la WebP ≤ 500KB

* Dimensiuni maxime: 1920×1920px

* Imaginile portret: afișaj pe fundal negru

**Tab Program**

* Bifa eveniment pe toata ziua / Data inceput (calendar dd/mm/yyy) / ora inceput (format 24:00) / Data sfarsit / ora sfarsit

**Tab Contact**

* Telefoane contact (max 2), email, website, Social media links (Field labes with icons)

**Final step \- thank you** 

* Dupa transmiterea formularului, ultima afisare a formularului trebuie sa fie un icon mare de checkbox round, “Datele au fost transmise cu succes / Listarea a fost transmisa catre aprobare \- vei primi un email cu confirmarea aprobarii listarii.

---

## **8\) Flux aprobare listări**

* ⦁ Toate formularele listarilor completate si transmise intra automat in /cont in tabul fiecaruia in status "in asteptare aprobare" / abia dupa aprobare in admin vor trece in status aprobat

---

## **9\) Mesaje**

* Sectiune de mesagerie live cu istoric conversatii – Notifica clientul pe email pentru fiecare mesaj primit

---

## **10\) Favorite**

* Favorite \- grid carduri listari salvate ca favorite impartite pe categorii e listari – cu posibilitate de eliminare din lista

---

## **11\) Promovare listări (viitor)**

* La toate tipurile de listari din cont, in viitor, vom adauga pe lista buton de Promoveaza listare \+ in formular, tab Promoveaza cu selectia tipului de promovare dorita \+ transfer catre plata.

**Pagini dedicate listărilor — structură și conținut (stil organizat)**

Rute preferate (exemple SEO-friendly):  
**/oras/locatie/{nume-locatie}**, **/oras/serviciu/{nume-serviciu}**, **/oras/eveniment/{nume-eveniment}**  
Alternative: **/locatie/{slug}**, **/serviciu/{slug}**, **/eveniment/{slug}**

---

**Elemente comune (valabile pentru toate tipurile)**

1. **Breadcrumbs**

* Acasă › {Oraș} › {Tip} › {Titlu}

2. **Hero / Header card**

* **Titlu** (din formular)  
* **Badge „Verificat”** (dacă aprobarea/verificarea este activă)  
* **Medie rating** (+ nr. recenzii, dacă există)  
* **Icone acțiuni**: Favorite, Share, Raportează  
* **Buton principal**: „Contactează” / „Trimite mesaj” (deschide Mesagerie directă)  
* **Meta-informații scurte** (variază după tip: oraș, capacitate, categorie, dată/ora)

3. **Galerie media**

* **Imagine principală** (1)  
* **Galerie foto** (până la 10\) – Lightbox / scrollable  
* **Link YouTube** (până la 3\) – randate ca embed  
* **Specificații afișare**: portret pe fundal negru, text alternativ generat automat

4. **Card „Gazdă/Furnizor/Organizator” (sidebar)**

* Poză profil, Nume, Badge „Verificat” (dacă e cazul)  
* Oraș  
* Linkuri: Website, Social media  
* Butoane: „Trimite mesaj”, „Vezi toate listările”  
* Vezi cont – trimitere catre /profil/{slug-nume-utilizator}  
* Distribuie in social media (icons)

5. **Secțiune Contact (sidebar sau secțiune)**

* Telefon(e) (max 2\) – link tel:+40...  
* Email – link mailto:  
* Website – link (ahref target blank)  
* Social media (cu iconițe) (ahref target blank)

6. **Hartă & Adresă**

* Adresă completă (autodetect Google Maps)  
* Pin pe hartă   
* Oraș (dropdown selectat la creare)  
* Coordonate (doar afișate pe hartă)

7. **SEO & meta (per pagină)**

* Meta title, meta description (auto din titlu \+ tip \+ oraș)  
* Open Graph (imagine principală)  
* URL canonic (formatul SEO ales)

8. **Secțiuni recomandări**

* „Listări similare în {Oraș}” (carusel)  
* „Poate te interesează și” (cross-listing: pentru locații → servicii, pentru servicii → locații, pentru evenimente → locații/servicii)

9. **Stare listare**

* Badge „În așteptare” / „Aprobat” / „Respins” (vizibil doar proprietar \+ admin; public doar „Aprobat”)

10. **CTA Promovare (viitor)**

* Buton „Promovează listarea” (dacă utilizatorul este proprietarul listării)  
* Tab „Promovează” (selectare pachet \+ redirecționare la plată)

---

**Pagina /locatie (ex. /timisoara/locatie/{nume-locatie})**

**Hero imagine principala (galerie mica imagini sub principala – cu selectie – vezi pagini actuale)**

1. **Info esențiale (sub hero)** 

**Tip locație** (din listă cu căutare) – badge

* **Titlu locatie**  
* **Destinată pentru** (tags: tipuri de evenimente)  
* **Capacitate maximă (persoane**  
* **Suprafață (m²)**  
* **Oraș**  
* **Preț (opțional)**  
  * Bifa „Adaugă preț pentru închiriere”:  
    * **Facturare**: pe oră / pe zi (dropdown)  
    * **Preț (RON)**

**Icons – Distrubie social media**

**B. Descriere**

* **Descriere locație** (text din formular)

**C. Facilități**

* **Categorii facilități** (ex. Catering & Bar)  
  * Listă multi-choice selectată (ex.: Bar echipat, Bucătărie profesională, Cuptoare / plite etc.)

**D. Media**

* Imagine principală \+ Galerie (max 10\)  
* Linkuri YouTube (max 3\)

**E. Adresă & Hartă**

* **Oraș** (dropdown)  
* **Adresă completă** (Google Maps auto-detect)  
* **Pin pe hartă** (editabil la creare)

**F. Contact**

* **Telefoane** (max 2\)  
* **Email**  
* **Website**  
* **Social media** (cu iconițe)

**G. Recenzii / Adauga recenzie**

* Stars (max 5\) – cu medie din total recenzii  
* Comentarii recenzii  
* Doar utilizatorii logati pot lasa recenzii (1/listare/utilizator)

---

**Pagina /serviciu (ex. /cluj-napoca/serviciu/{nume-serviciu})** 

**Hero – Stanga foto profil / Cover prima foto din galerie**

**A. Info esențiale (sub hero)**

* **Nume furnizor servicii** (ex.: DJ Marian)  
* **Destinat pentru** (tags: tipuri de evenimente)  
* **Categorie servicii** (multi-choice cu căutare; randate ca tags)  
* **Oraș**  
* **Preț (opțional)**  
  * Bifa „Adaugă preț pentru servicii”:  
    * **Facturare**: pe oră / pe zi (dropdown)  
    * **Preț (RON)**

**B. Descriere**

* **Descriere servicii** (text din formular)

**C. Servicii oferite (tag-uri)**

* Liste pe categorii (similar cu facilitățile de la locații, dar pentru servicii)

**D. Media**

* **Imagine profil** (1)  
* **Galerie foto** (max 10\)  
* **Linkuri YouTube** (max 3\)

**E. Adresă & Hartă**

* **Oraș** (dropdown)  
* **Adresă completă** (Google Maps auto-detect)  
* **Pin pe hartă** (editabil)

**F. Contact**

* **Telefoane** (max 2\)  
* **Email**  
* **Website**  
* **Social media**

**G. Recenzii / Adauga recenzie**

* Stars (max 5\) – cu medie din total recenzii  
* Comentarii recenzii  
* Doar utilizatorii logati pot lasa recenzii (1/listare/utilizator)

---

**Pagina /eveniment (ex. /brasov/eveniment/{nume-eveniment})**

**Hero imagine principala (galerie mica imagini sub principala – cu selectie – vezi pagini actuale)**

**A. Info esențiale (sub hero)**

* **Tip eveniment**  
* **Date & Program**  
  * Bifă „Eveniment pe toată ziua”  
  * **Data început** (dd/mm/yyyy) & **Ora început** (24:00)  
  * **Data sfârșit** & **Ora sfârșit**  
  * **Oraș**   
* **CTA \- Participă la eveniment \- button / număr participanți**  
* **Bilete / Acces**  
  * **Preț bilet (opțional)**  
  * Bifa „Adaugă preț bilet” → **Preț (RON)** sau **Intrare liberă**

**B. Descriere**

* **Descriere eveniment** (text din formular)

**C. Media**

* **Imagine principală** (1)  
* **Galerie foto** (max 10\)  
* **Linkuri YouTube** (max 3\)

**D. Locație & Hartă**

* **Oraș** (dropdown)  
* **Adresă completă** (Google Maps auto-detect)  
* **Pin pe hartă** (editabil)  
* (Opțional) **Locație găzduire** (link către pagina locației, dacă este în platformă)

**E. Contact**

* **Telefoane** (max 2\)  
* **Email**  
* **Website**  
* **Social media**

**F. Informații tehnice imagini (informativ)**

* Formate: JPG, PNG, WebP  
* Comprimare automată la WebP ≤ 500KB  
* Dimensiuni maxime: 1920×1920px  
* Portret: fundal negru

**G. Stare eveniment**

* **În așteptare / Aprobat / Respins / FINALIZAT** (după caz)

**H. Recenzii / Adauga recenzie**

* Stars (max 5\) – cu medie din total recenzii  
* Comentarii recenzii  
* Doar utilizatorii logati pot lasa recenzii (1/listare/utilizator)

---

**Secțiuni suplimentare utile (opționale, toate tipurile)**

* **FAQ** (acordeon): Politici, program, facilități, sunet, oră liniște, logistică, anulare (dacă se adaugă ulterior)  
* **Politici legate de conținut media** (drepturi, brand, etc. – dacă se adaugă ulterior)  
* **Micro-copy legal**: „Date afișate conform declarațiilor furnizorului/organizatorului.”  
* **Schema markup** (recomandat): LocalBusiness / Event / Organization (în funcție de tip)

---

**Elemente de navigație/URL**

* **Exemple URL**  
  * Locație: /timisoara/locatie/salon-nora  
  * Serviciu: /cluj-napoca/serviciu/dj-marian  
  * Eveniment: /brasov/eveniment/concert-jazz-de-iarna  
* **Parametri UTM** (share): adăugați automat la „Copiază link” pentru tracking.

---

**Componente de status & moderare (back-office, reflectate în UI)**

* **Afișare publică** doar pentru status „Aprobat”  
* **Banner privat** pentru proprietar când este „În așteptare” sau „Respins” (+ motiv respingere)  
* **Badge „Verificat”** sincron cu aprobarea verificării contului

**/profil utilizator — structură și conținut (stil organizat)**

Rută recomandată: **/profil/{username-sau-id}**  
(opțional SEO: **/oras/profil/{username}**)

---

**1\) Header profil (Hero compact)**

* **Avatar** (rotund, 96–128px)  
* **Nume afișat** (ex.: *Ernest Slach*)  
* **Badge „Verificat”** (dacă există)  
* **Rating mediu** \+ **număr evaluări** (ex.: ★ 5.0 – *1 evaluări*)  
* **Badge „Membru din {zi.lună.an}”** (ex.: *Membru din 03.09.2025*)  
* **Tagline / Bio scurtă** (o frază sub nume; ex.: *Șmecherie pane pe grătar*)  
* **Rețele sociale** (iconițe: Facebook, Instagram, X, LinkedIn, YouTube, TikTok – link-uri deschise în tab nou)  
* **Acțiuni rapide (dreapta):**  
  * **Buton „Sună”** (apel telefonic pe mobil / tel: pe desktop)  
  * (opțional) **Mesaj** (deschide mesageria), **Share**, **Raportează**

---

**2\) Metrici & statut (opțional, sub header)**

* **Roluri active** (Client / Furnizor servicii / Organizator / Proprietar locație) — randate ca badges  
* **Oraș / Zonă** (dacă utilizatorul a completat)  
* **Timp mediu de răspuns** (dacă e disponibil)  
* **Ultima activitate** (online/offline – dacă e permis)

---

**3\) Secțiunea „Listări (n)”**

Container card cu titlu **„Listări (n)”** și **tab-uri**:

* **Evenimente (x)**  
* **Locații (y)**  
* **Servicii (z)**

**3.1 Tabul „Evenimente”**

* **Gol:** mesaj „Nu există evenimente publicate”  
* **Card eveniment** (când există):  
  * Imagine principală  
  * Titlu (max 80–100)  
  * Meta: tip eveniment, oraș, date & ore (început/sfârșit)  
  * Rating (dacă are), badge „Verificat” (dacă există)  
  * CTA: **Vezi detalii** (full-width pe mobil)

**3.2 Tabul „Locații”**

* **Card locație**:  
  * Imagine principală  
  * Titlu (max 80–100)  
  * Meta: oraș, capacitate, tip locație  
  * Rating, badge „Verificat” (dacă există)  
  * CTA: **Vezi detalii**

**3.3 Tabul „Servicii”**

* **Card serviciu**:  
  * Imagine profil furnizor / copertă  
  * Nume serviciu (ex.: DJ Marian)  
  * Meta: oraș, categorie servicii / tag-uri  
  * Rating, badge „Verificat” (dacă există)  
  * CTA: **Vezi detalii**

**Comportament tab-uri (toate):**

* Sortare (Implicit: „Cele mai recente”)  
* Filtre (oraș / categorie / status) — opțional  
* Paginare sau încărcare progresivă  
* Favorite (icon hart) — dacă vizitatorul e logat

---

**4\) Secțiunea „Evaluări și recenzii (n)”**

* **Sumar rating**: medie, distribuție (opțional)  
* **Listă recenzii** (exemplu din screenshot):  
  * Avatar autor, Nume (ex.: *Testache Tester*)  
  * **Rating** (stele) \+ **data** (ex.: *06.09.2025*)  
  * **Comentariu** (text)  
* **Empty state:** „Acest profil nu are încă recenzii.”  
* **CTA:** „Lasă o evaluare” (dacă ai avut o interacțiune validă conform regulilor)  
* **Politică recenzii:** afișată într-un tooltip/link

---

**5\) Sidebar / acțiuni (dacă layout-ul prevede)**

* **Contact rapid:**  
  * **Sună**, **Trimite mesaj**, **Trimite email**  
* **Link-uri externe:** Website, Socials (cu iconițe)  
* **Buton „Raportează profil”** (abuz, conținut fals etc.)  
* **Distribuie** (copiere link \+ share social)

*(În layout-ul din screenshot, „Sună” este în dreapta header-ului; pe mobil, mutat sub bio.)*

---

**6\) SEO & accesibilitate**

* **Meta title**: „{Nume profil} – listări & recenzii | UN:EVENT”  
* **Meta description**: 150–160 caractere din bio \+ tipuri listări  
* **Open Graph**: avatar/cover, nume, descriere  
* **Schema.org**: Person sau Organization (după caz) \+ AggregateRating dacă există  
* **A11y**: ALT pentru avatar, etichete pentru iconițe social, focus states

---

**7\) Stări & permisiuni**

* **Privat vs Public:** Câmpurile sensibile (telefon, email) pot fi mascate pentru vizitatori neautentificați (configurabil).  
* **Verificare cont:** Dacă utilizatorul este „verificat”, badge prezent sub nume și în cardurile listărilor sale.  
* **Conținut moderat:** Listările respinse sau în așteptare nu apar public pe profil.

---

**8\) Elemente de încredere (opțional)**

* **„Membru din {data}”** (badge, prezent în screenshot)  
* **„ID verificat” / „Firmă verificată”** (dacă procesul a fost finalizat)  
* **Răspunsuri rapide**: procent / timp mediu (dacă disponibil)

---

**9\) Componente reutilizabile**

* **UserHeader** (avatar, nume, rating, membru din, tagline, social, call)  
* **UserTabs** (Evenimente / Locații / Servicii cu counters)  
* **ListingCard** (variantă Eveniment / Locație / Serviciu)  
* **ReviewsList** (element recenzie \+ formular)  
* **ProfileActions** (Sună, Mesaj, Share, Report)

---

**10\) Empty states & microcopy**

* **Evenimente:** „Nu există evenimente publicate”  
* **Locații/Servicii:** „Nu există listări publicate”  
* **Recenzii:** „Acest profil nu are încă recenzii.”  
* **Buton fallback:** „Vezi toate listările utilizatorului” (dacă există cel puțin una în alt tab)

**Pagini dedicate filtrare listări — structură (fără modificări de text)**

**1\) Header pagină (comun)**

* **Titlu stânga sus:** *Locatii* sau *Servicii* sau *Evenimente*  
* **Subtitlu:** *Descopera {nr listar} locatii/servicii/evenimente*  
* **Dreapta sus — buton cu icon specific:** *Listaza locatia ta* / *Listeaza serviciile tale* / *Listeaza evenimentul tau* – **acțiuni ca celel din homepage sub hero**

---

**2\) Filtre (secțiune cu tab-uri)**

**2.1 Tab Locatii tab**

* • **Ce eveniment organizezi?** (Cautare tip eveniment asociat listarii sub forma de tags)  
* • **Unde (Locatie \- Oras)**  
* • **Tip Locatie**  
* • **Avansate (reaveal)** \- Capacitate: (persoane) Min-Max cu bara de setare interval capacitate si number fields / Pret? Interval preț locație (RON) Min-Max, bara de setare interval pret si number fields

**2.2 Tab Servicii tab**

* • **Ce serviciu cauti?** (Categorii de servicii)  
* • **Unde?** (locatie Oras)  
* • **Pentru ce tip de eveniment?** (Event types tags asociate listarilor de servicii)

**2.3 Tab Evenimente tab**

* • **Ce tip de eveniment?**  
* • **Unde?**  
* • **Când?** (orice data, astazi, maine, saptamana aceasta, saptamana viitoare, luna.. data specifica)

**2.4 Căutări (format URL exemplu)**

* • **/locatii?city=timisoara\&type=bar/**

**2.5 Dropdowns**

* • **selectare filtre scrolabile si cu optiune de Cautare in dropdown**

**2.6 Optiune**

* **Optiune de resetare filtre**

---

**3\) Rezultate (grid & ordonare)**

* **Grid listari** – toate listarile daca nu sunt filtre (cele recomandate apar primele, in rest dupa data publicarii)

---

**4\) Mod afişare listă / hartă**

* **Center bottom – buton cu icon:** *Arata harta* / *Arata lista*  
* **Harta Google maps** – se modifica automat sa arate toate pin-urile listarilor pe harta / dupa filtrare se auto regleaza sa arate pinurile listarilor filtrate / **click per pin** deschide casuta mica cu imagine principala, titlu, tip... **buton Vezi detalii** ce duce la listare

---

**5\) Recomandate si sponsorizate**

* Cardurile listarilor ce vor fii marcate ca re**comandate ori sponsorizate** prin abonamente, trebuie să fie marcate cumva ca **Sponsorizat** \- pentru transparența platformei

**/admin — structură și conținut (stil organizat)**

**Tab-uri Admin:** **Listari** / **Recenzii** / **Recomandate** / **Verificari** / **Utilizatori** / **Raportari** / **Analitice** / **Abonamente (în viitor)** / **Promovate (în viitor)**

---

**1\) Listari**

**Tabs interne:** **Locații** · **Servicii** · **Evenimente**  
**Ce face:** vede și gestionează toate listările utilizatorilor.

**Coloane / câmpuri listă:**

* **Titlu**  
* **Oraș**  
* **Tip** (locație / eveniment / servicii)  
* **Utilizator** (cu posibilitate de a schimba utilizatorul – dropdown cu funcție de căutare)  
* **Data creării**  
* **Status** (În așteptare, Aprobat, Respins, Finalizat – **Finalizat** doar pentru evenimente)

**Acțiuni:**

* **Vezi** – vede listarea completă indiferent de status  
* **Editează** – deschide formular de editare  
* **Aprobă / Respinge**  
* **Șterge**

---

**2\) Recenzii**

**Ce face:** management recenzii.

**Coloane / câmpuri listă:**

* **Recenzie** (conținut scurt)  
* **Listarea asociată** (link)  
* **Data creării**  
* **Utilizator**  
* **Status** (În așteptare / Aprobat / Respins)

**Acțiuni:**

* **Aprobă / Respinge**  
* **Șterge**

---

**3\) Recomandate**

**Ce face:** gestionează listările recomandate.

**Listă:**

* Toate listările (indiferent de tip)

**Acțiuni:**

* **Adaugă la recomandate** / **Elimină din recomandate**

**Efect:**

* Apare în caruselurile din prima pagină pe categoria de listare  
* Apare în primele căutări sugerate în funcție de **oraș** și **tip de eveniment / tip de locație / tip de serviciu**

---

**4\) Verificari**

**Ce face:** procesează formularele din **/cont → Verifică-ți contul**.

**Listă / detalii:**

* **Toate datele transmise** de utilizator (nume complet, adresă, copie CI, firmă: nume companie, CUI, adresă sediu social, copie CUI, declarații etc.)

**Acțiuni:**

* **Aprobă**  
* **Respinge**

---

**5\) Utilizatori**

**Ce face:** administrare conturi utilizatori.

**Coloane / câmpuri listă:**

* **Utilizator**  
* **Data creării contului**  
* **Rating**  
* **Roluri** (poate adăuga sau modifica roluri)

**Acțiuni:**

* **Suspendă**  
* **Adaugă „verificat”**  
* **Șterge**  
* **Vezi profil**

---

**6\) Raportari**

**Ce face:** gestionează conținutul raportat.

**Listă:**

* **Listări** sau **conturi** marcate ca raportate

**Acțiuni:**

* **Elimină flag** (rezolvă raportarea)

---

**7\) Analitice (în viitor)**

**Ce face:** statistici platformă.

**Indicatori:**

* **Listări** – număr de vizualizări  
* **Categorii / Tipuri de evenimente / Locații / Servicii** – număr de vizualizări  
* **Clicks pe „Apelează”** – la ce listare

---

**8\) Abonamente (în viitor)**

**Ce face:** management planuri de abonare utilizatori.

**Listă:**

* **Utilizatori abonați**  
* **Tip de abonamente**

**Acțiuni:**

* **Suspendă**  
* **Anulează**

---

**9\) Promovate (în viitor)**

**Ce face:** administrare listări promovate.

**Listă:**

* **Listări promovate**  
* **Tip de promovare**  
* **Data început / finalizare promovare**

**Acțiuni:**

* **Suspendă**  
* **Anulează**

**10\) Pagină Despre noi \- /despre-noi → vezi app actual** 

**11\) Pagină Contact \- /contact → vezi app actual** 

**12\) Pagini Termeni și condiții / Politică de confidențialitate / Politica cookie \- /termeni-si-contidii, /politica-de-confidentialitate, /politica-cookie → vezi app actual** 

**\*\*\*De adaugat email templates – Vezi in Drive / Dev Plan**