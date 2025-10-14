# UN:EVENT — SEO Blueprint pentru pagini oraș \+ categorie

Obiectiv: să rankeze pe interogări precum „locație nuntă {oraș}”, „sală {eveniment} {oraș}”, „trupă {eveniment} {oraș}”.

12 October 2025

# **1\) Arhitectură URL clară (programmatic SEO-ready)**

* Oraș ⇒ /oras/{slug-oras}  
* Locații ⇒ /oras/{slug-oras}/locatii  
* Locații \+ tip eveniment ⇒ /oras/{slug-oras}/locatii/{tip-eveniment} (ex: /oras/timisoara/locatii/nunta)  
* Servicii ⇒ /oras/{slug-oras}/servicii  
* Servicii \+ tip ⇒ /oras/{slug-oras}/servicii/{categorie} (ex: /oras/timisoara/servicii/trupe-nunta)  
* Evenimente ⇒ /oras/{slug-oras}/evenimente  
* Detaliu listare (conform spec): Locație — /oras/locatie/{slug}; Serviciu — /oras/serviciu/{slug}; Eveniment — /oras/eveniment/{slug}  
* Reguli slug: fără diacritice, lowercase, separator „-”.  
* Canonicale: fiecare pagină are self-canonical; numai combinația „oraș \+ categorie” este indexabilă. Facetele cu filtre → noindex,follow.

# **2\) Pagini HUB „oraș \+ intenție”**

Fiecare HUB include: H1 specific, intro unic 120–180 cuvinte, grid cu ItemList schema (index doar fără parametri), top 10 recomandări (editorial), FAQ (FAQPage) local, interlinking către prestatori și evenimente din {Oraș}.

* „Locații nuntă în {Oraș}” (și alte tipuri: botez, corporate etc.)  
* „Săli {tip eveniment} în {Oraș}”  
* „Trupe {tip eveniment} în {Oraș}”

# **3\) Faceted navigation & indexare**

* Indexabile: doar /oras/{oras}/locatii, /locatii/{tip}, /servicii, /servicii/{tip}, /evenimente (fără querystring).  
* noindex,follow pe orice URL cu parametri (ex: ?data=...\&pretMin=...).  
* Paginare: canonical self; pagina 2+ rămâne indexabilă, H1 marcat cu „(pagina 2)”.  
* Breadcrumbs vizibile \+ BreadcrumbList (schema).

# **4\) Template meta (Next.js App Router)**

* Title: „Locații {tip-eveniment} în {Oraș} — UN:EVENT”.  
* Meta description: „Vezi cele mai bune locații pentru {tip-eveniment} în {Oraș}: capacitate, preț, hartă, recenzii verificate.”  
* OG/Twitter: imagine 1200×630, logo, număr listări.

# **5\) Schema.org (JSON-LD) esențială**

* Listare Locație: LocalBusiness/Place (address, geo, image, aggregateRating, amenityFeature, sameAs).  
* Listare Serviciu (ex: trupă): MusicGroup/PerformingGroup \+ areaServed, offers, aggregateRating, sameAs.  
* Eveniment: Event (location, startDate, endDate, offers, organizer).  
* Pagini listă: ItemList cu link spre fiecare listare.  
* Global: WebSite (SearchAction) \+ Organization (logo, sameAs).

# **6\) Sitemaps segmentate**

Webhook PayloadCMS la creare/editare/aprobare: revalidate ISR \+ regenerare entry în sitemap (sau next-sitemap on-demand).

* /sitemap.xml (index) care referă:  
* /sitemap-cities.xml — HUB-uri pe oraș  
* /sitemap-categories.xml — HUB-uri pe tip (oraș+tip)  
* /sitemap-listings-locatii.xml — detalii locații  
* /sitemap-listings-servicii.xml — detalii servicii  
* /sitemap-listings-evenimente.xml — detalii evenimente  
* /sitemap-articles.xml — ghiduri/editoriale  
* /sitemap-images.xml / /sitemap-videos.xml — dacă este cazul

# **7\) Render & performanță (pentru ranking real)**

* ISR pentru HUB-uri (revalidate 6–12h), SSG pre-build pentru top 50 orașe × 10 categorii.  
* Next/Image cu priority, sizes corecte; AVIF/WEBP; alt descriptiv.  
* Font: display=swap, subset latin, weights limitate.  
* CSS critic mic; JS minim pe listă; preconnect la providerul hărții.  
* LCP \< 2.5s (mobil), CLS \~0; monitorizare CrUX \+ GSC.

# **8\) Conținut care câștigă intenția**

* Ghiduri programatice: „Top 25 locații nuntă în {Oraș} (2025)”, „Cât costă o trupă de nuntă în {Oraș}”, „Checklist nuntă {Oraș}”.  
* Pagini how‑to locale: reguli oră de liniște, taxe locale, spații outdoor populare.  
* Descrieri unice pe listări (min 300–500 cuvinte).

# **9\) Recenzii & E‑E‑A‑T**

* Recenzii verificate post‑eveniment (dovadă rezervare).  
* AggregateRating \+ reviewBody/author.  
* Profil organizator/host cu nume, foto, sameAs, vechime, „verified badge”.  
* Pagină „Despre UN:EVENT” cu echipă, contact, companie (SC PIXEL FACTORY SRL).

# **10\) Interlinking care mută munții**

* În detaliu locație: prestatori populari pentru {tip} în {Oraș} \+ evenimente în {Oraș}.  
* În detaliu prestator: locații potrivite pentru {tip} în {Oraș}.  
* În HUB oraș: secțiuni cartiere/zone \+ orașe din proximitate (clustere regionale).

# **11\) Local SEO (intenții „{oraș}”)**

* NAP complet, hartă, orar (dacă relevant), zone deservite.  
* Pentru trupe/servicii: areaServed \+ availableChannel (la nevoie).  
* Fotografii reale ≥ 1200px \+ ImageObject în schema.

# **12\) Robots & igienă**

* robots.txt: Allow all; Disallow /admin, /api, /preview, /draft.  
* X‑Robots‑Tag: noindex pe JSON/feede.  
* UGC extern: rel="ugc nofollow".  
* 404/410 curate; redirect 301 la schimbare slug.

# **13\) Tracking & măsurare**

* Google Search Console: sitemap‑uri pe segmente, validare HUB‑uri.  
* Event custom: click‑through din HUB → detaliu listare.  
* Măsori: poziții (locații nuntă {oraș}, sală botez {oraș}, trupă nuntă {oraș}), CTR, „Contactează organizatorul”.

# **Snippets utile (Next.js \+ TypeScript)**

## **a) Canonical & robots (App Router)**

// app/oras/\[city\]/locatii/\[category\]/page.tsx  
export async function generateMetadata({ params }: { params: { city: string; category: string } }) {  
  const url \= \`https://unevent.ro/oras/${params.city}/locatii/${params.category}\`;  
  return {  
    title: \`Locații ${params.category} în ${params.city} — UN:EVENT\`,  
    description: \`Vezi cele mai bune locații pentru ${params.category} în ${params.city}: capacitate, preț, hartă, recenzii.\`,  
    alternates: { canonical: url },  
    robots: { index: true, follow: true },  
    openGraph: { url, type: 'website' }  
  };  
}

## **b) Noindex pe facetări**

// app/oras/\[city\]/locatii/page.tsx  
import { headers } from 'next/headers';

export async function generateMetadata() {  
  const h \= headers();  
  const hasParams \= \!\!h.get('x-internal-has-facets'); // setezi tu în middleware când vezi query  
  return {  
    robots: hasParams ? { index: false, follow: true } : { index: true, follow: true }  
  };  
}

## **c) JSON-LD ItemList pe pagină listă**

const itemListJsonLd \= {  
  "@context": "https://schema.org",  
  "@type": "ItemList",  
  "itemListElement": results.map((r, i) \=\> ({  
    "@type": "ListItem",  
    "position": i \+ 1,  
    "url": \`https://unevent.ro/oras/locatie/${r.slug}\`  
  }))  
};

## **d) WebSite \+ SearchAction (global)**

\<script type="application/ld+json" dangerouslySetInnerHTML={{\_\_html: JSON.stringify({  
  "@context": "https://schema.org",  
  "@type": "WebSite",  
  "url": "https://unevent.ro",  
  "name": "UN:EVENT",  
  "potentialAction": {  
    "@type": "SearchAction",  
    "target": "https://unevent.ro/cauta?q={search\_term\_string}",  
    "query-input": "required name=search\_term\_string"  
  }  
})}} /\>

## **e) next-sitemap (sitemaps segmentate)**

// next-sitemap.config.mjs  
export default {  
  siteUrl: 'https://unevent.ro',  
  generateRobotsTxt: true,  
  sitemapSize: 5000,  
  exclude: \['/admin/\*', '/api/\*', '/preview\*', '/draft\*'\],  
  transform: async (config, path) \=\> ({ loc: path, changefreq: 'daily', priority: 0.7 }),  
  additionalSitemaps: \[  
    'https://unevent.ro/sitemap-cities.xml',  
    'https://unevent.ro/sitemap-categories.xml',  
    'https://unevent.ro/sitemap-listings-locatii.xml',  
    'https://unevent.ro/sitemap-listings-servicii.xml',  
    'https://unevent.ro/sitemap-listings-evenimente.xml',  
    'https://unevent.ro/sitemap-articles.xml'  
  \]  
};

## **f) Hook PayloadCMS → revalidate \+ ping sitemap**

// Pseudocod: afterChange/afterCreate (PayloadCMS v3)  
await fetch('https://unevent.ro/api/revalidate?path=/oras/...', { method: 'POST' });  
await fetch('https://www.google.com/ping?sitemap=https://unevent.ro/sitemap.xml');

# **Check‑list de implementare (rezumat)**

* URL & routing: HUB‑uri pe oraș+tip (indexabile), facetări noindex.  
* Metadata & schema: LocalBusiness/Place, MusicGroup, Event, ItemList, BreadcrumbList, FAQPage, WebSite.  
* Sitemaps segmentate \+ webhook Payload pentru revalidate/ping.  
* ISR/SSG pentru viteză.  
* Conținut unic pe HUB \+ descrieri originale pe listinguri.  
* Interlinking între orașe/tipuri și între listări/prestatori/evenimente.  
* Recenzii verificate \+ AggregateRating.  
* Monitorizare în GSC; CWV: LCP \< 2.5s mobil.