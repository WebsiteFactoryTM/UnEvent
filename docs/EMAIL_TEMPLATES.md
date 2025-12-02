Hai sa cream template-urile de email. 
Pentru client/gazda locatie/prestator servicii/organizator evenimetne:
- Bun venit si Confirmare email la inregistrare
- Eveniment - Un participant nou (Trigger pe participa la eveniment)
- Mesaj de resetare parola
- Confirmare resetare parola
- Ai un mesaj nou de la {nume utilizator}
- Listarea ta a fost acceptata si este activa in platforma - link listare
- Listarea ta a fost respinsa - motiv respingere
- Evenimentul s-a incheiat - listarea a intrat in status "Finalizat"
- Listarea ta a fost adaugata la "Recomandate"
- Listarea ta a aparut in (X nr) cautari
- Listarea ta a fost vizualizata de (x nr vizualizari)
- Contul tau a fost verificat cu succes
- Verificarea contului a fost respinsa - motiv
- Confirmare stergere cont
- Listarea ta a fost adaugata la favorite
- Ai o noua recenzie {link listare}
- Recenzia ta a fost acceptata
- Recenzia ta a fost respinsa
- Reminder participare la eveniment - pentru client care a bifat ca participa
-  Participi la eveniment {eveniment} link catre listare
- 
Pentru Admin
- O listare noua asteapta aprobare
- O recenzie noua asteapta aprobare
- S-a inregistrat un nou utilizator
- Ai o raportare noua
- Un utilizator si-a schimbat parola cu succes
- Solicitare noua de Verificare cont

Nu te concentra pe cod, doar template emails - e important sa fie cat mai succinte si user friendly

Super! Ți-am pregătit template-uri scurte, clare și prietenoase, cu aceleași variabile peste tot (le poți adapta după rol: gazdă/organizator/prestator/client).
Variabile: {{first_name}}, {{listing_title}}, {{event_title}}, {{city}}, {{start_date}}, {{start_time}}, {{sender_name}}, {{message_snippet}}, {{cta_url}}, {{dashboard_url}}, {{reason}}, {{search_count}}, {{views_count}}, {{period}}, {{rating}}, {{support_email}}, {{expires_in}}.

Pentru utilizatori (gazdă / prestator / organizator / client)

1) Bun venit & confirmare email
Subiect: Bine ai venit la UN:EVENT — confirmă-ți emailul
Preheader: Activează-ți contul în câteva secunde.
Conținut:
Salut, {{first_name}}! Te-ai înregistrat cu succes. Confirmă adresa ca să-ți activezi contul.
CTA: Confirmă emailul → {{cta_url}}
Dacă nu ai creat tu contul, ignoră acest email.
— Echipa UN:EVENT

2) Eveniment — ai un participant nou
Subiect: 🎟️ Participant nou la {{event_title}}
Preheader: Cineva s-a înscris la evenimentul tău.
Conținut:
Salut, {{first_name}}! Ai un participant nou pentru „{{event_title}}” ({{start_date}}, {{start_time}}).
Vezi detalii și contacte în dashboard.
CTA: Vezi participanții → {{dashboard_url}}
— UN:EVENT

3) Resetare parolă — link
Subiect: Resetează-ți parola la UN:EVENT
Preheader: Linkul expiră în {{expires_in}}.
Conținut:
Salut, {{first_name}}! Ai cerut resetarea parolei. Apasă pe buton pentru a continua.
CTA: Resetează parola → {{cta_url}}
Dacă nu ai cerut tu, ignoră acest email.
— UN:EVENT

4) Confirmare resetare parolă
Subiect: Parola a fost schimbată
Preheader: Dacă nu ești tu, securizează-ți contul.
Conținut:
Salut, {{first_name}}! Parola contului tău UN:EVENT a fost actualizată.
Dacă nu ai fost tu, schimbă imediat parola și contactează-ne la {{support_email}}.
— UN:EVENT

5) Mesaj nou
Subiect: ✉️ Mesaj nou de la {{sender_name}}
Preheader: „{{message_snippet}}”
Conținut:
Salut, {{first_name}}! Ai primit un mesaj nou legat de „{{listing_title}}”.
Răspunde rapid din conversație.
CTA: Deschide mesajul → {{dashboard_url}}
— UN:EVENT

6) Listarea ta a fost acceptată (este live)
Subiect: 🎉 „{{listing_title}}” este acum live pe UN:EVENT
Preheader: Ești vizibil(ă) în căutări.
Conținut:
Felicitări, {{first_name}}! Listarea ta este publică și gata să primească contacte.
CTA: Vezi listarea → {{cta_url}}
— UN:EVENT

7) Listarea ta a fost respinsă
Subiect: „{{listing_title}}” nu a fost aprobată
Preheader: Vezi motivul și editează.
Conținut:
Salut, {{first_name}}! Din păcate, listarea ta nu a fost aprobată.
Motiv: {{reason}}
CTA: Editează și retrimite → {{dashboard_url}}
— UN:EVENT

8) Eveniment încheiat — status „Finalizat”
Subiect: Evenimentul „{{event_title}}” s-a încheiat
Preheader: Marchează recap/poze și solicită recenzii.
Conținut:
Salut, {{first_name}}! Am trecut evenimentul în „Finalizat”.
Poți adăuga poze și cere recenzii participanților.
CTA: Gestionează recap → {{dashboard_url}}
— UN:EVENT

9) Listarea ta a intrat la „Recomandate”
Subiect: ⭐ „{{listing_title}}” a fost adăugată la Recomandate
Preheader: Vizibilitate crescută în listări.
Conținut:
Bravo, {{first_name}}! Listarea ta apare acum în secțiunea Recomandate.
CTA: Vezi cum arată → {{cta_url}}
— UN:EVENT

10) Apariții în căutări
Subiect: „{{listing_title}}” a apărut în {{search_count}} căutări
Preheader: Optimizează pentru și mai mult trafic.
Conținut:
Salut, {{first_name}}! În {{period}}, listarea ta a apărut în {{search_count}} căutări.
Vezi termeni populari și sugestii de optimizare.
CTA: Deschide statistici → {{dashboard_url}}
— UN:EVENT

11) Vizualizări listare
Subiect: {{views_count}} vizualizări pentru „{{listing_title}}” în {{period}}
Preheader: Verifică detaliile în analytics.
Conținut:
Salut, {{first_name}}! Ai strâns {{views_count}} vizualizări.
Vezi sursele de trafic și acțiunile utilizatorilor.
CTA: Vezi analytics → {{dashboard_url}}
— UN:EVENT

12) Cont verificat
Subiect: ✅ Contul tău a fost verificat
Preheader: Ai primit badge-ul „Verificat”.
Conținut:
Salut, {{first_name}}! Verificarea a fost aprobată. Profilul tău afișează acum badge-ul „Verificat”.
CTA: Vezi profilul → {{cta_url}}
— UN:EVENT

13) Verificare respinsă
Subiect: Verificarea contului nu a fost aprobată
Preheader: Vezi motivul și retrimite documentele.
Conținut:
Salut, {{first_name}}! Din păcate, verificarea a fost respinsă.
Motiv: {{reason}}
CTA: Retrimite documentele → {{dashboard_url}}
— UN:EVENT

14) Confirmare ștergere cont
Subiect: Contul tău a fost șters
Preheader: Ne pare rău să te vedem plecând.
Conținut:
Salut, {{first_name}}! Am șters contul tău la cerere.
Dacă e o greșeală, scrie-ne la {{support_email}}.
— UN:EVENT

15) Adăugată la favorite
Subiect: ❤️ „{{listing_title}}” a fost adăugată la favorite
Preheader: Interes în creștere pentru listarea ta.
Conținut:
Salut, {{first_name}}! Utilizatorii salvează „{{listing_title}}” la favorite.
Rămâi activ(ă) în mesaje pentru conversii rapide.
CTA: Vezi activitatea → {{dashboard_url}}
— UN:EVENT

16) Ai o recenzie nouă
Subiect: Ai primit o recenzie pentru „{{listing_title}}”
Preheader: Scor: {{rating}}★
Conținut:
Salut, {{first_name}}! Ai o recenzie nouă pentru „{{listing_title}}”.
Răspunde elegant și afișeaz-o pe profil.
CTA: Citește recenzia → {{cta_url}}
— UN:EVENT

17) Recenzia ta a fost acceptată
Subiect: Recenzia ta este publică — mulțumim!
Preheader: Comunitatea vede acum feedback-ul tău.
Conținut:
Salut, {{first_name}}! Recenzia ta a fost aprobată și este vizibilă pe platformă.
CTA: Vezi recenzia → {{cta_url}}
— UN:EVENT

18) Recenzia ta a fost respinsă
Subiect: Recenzia ta nu a fost publicată
Preheader: Vezi motivul și încearcă din nou.
Conținut:
Salut, {{first_name}}! Din păcate, recenzia ta a fost respinsă.
Motiv: {{reason}}
CTA: Revizuiește și retrimite → {{cta_url}}
— UN:EVENT

⸻

Pentru Admin

A) Listare nouă în așteptare
Subiect: 🔔 Listare nouă așteaptă aprobare
Preheader: {{listing_title}} — trimisă de {{first_name}}.
Conținut:
Listare nouă în coadă: „{{listing_title}}”.
CTA: Deschide moderarea → {{dashboard_url}}
— UN:EVENT Admin

B) Recenzie nouă în așteptare
Subiect: 🔎 Recenzie nouă așteaptă aprobare
Preheader: Verifică rapid conținutul.
Conținut:
A sosit o recenzie nouă pentru „{{listing_title}}”.
CTA: Moderează recenzia → {{dashboard_url}}
— UN:EVENT Admin

C) Utilizator nou înregistrat
Subiect: 👤 Utilizator nou: {{first_name}}
Preheader: Verifică profilul și activitatea inițială.
Conținut:
S-a creat un cont nou pe platformă.
CTA: Vezi profilul → {{dashboard_url}}
— UN:EVENT Admin

D) Raportare nouă
Subiect: ⚠️ Ai o raportare nouă
Preheader: Necesită evaluare.
Conținut:
A fost trimisă o raportare pentru „{{listing_title}}”/„{{event_title}}”.
CTA: Deschide raportarea → {{dashboard_url}}
— UN:EVENT Admin

E) Parolă schimbată cu succes (notificare securitate)
Subiect: Securitate: utilizator și-a schimbat parola
Preheader: Monitorizează activitatea dacă e necesar.
Conținut:
Utilizatorul {{first_name}} și-a actualizat parola.
CTA: Deschide jurnalul de securitate → {{dashboard_url}}
— UN:EVENT Admin

Perfect — am adăugat încă două, scurte și la obiect, pe același stil.

19) Reminder participare la eveniment (pentru client)
Subiect: 🔔 Reminder: participi la „{{event_title}}” ({{start_date}}, {{start_time}})
Preheader: Ne vedem la {{start_time}} — verifică detaliile evenimentului.
Conținut:
Salut, {{first_name}}! Ai confirmat participarea la „{{event_title}}” în {{city}}, pe {{start_date}} la {{start_time}}.
CTA: Deschide evenimentul → {{cta_url}}
Link secundar: Gestionează participarea → {{dashboard_url}}
Dacă nu mai poți ajunge, anulează din cont ca să anunțăm organizatorul.
— UN:EVENT

20) Confirmare: participi la eveniment
Subiect: ✅ Participi la „{{event_title}}”
Preheader: Ești pe listă — vezi pagina evenimentului.
Conținut:
Salut, {{first_name}}! Te-am înregistrat ca participant la „{{event_title}}” ({{start_date}}, {{start_time}}, {{city}}).
CTA: Vezi evenimentul → {{cta_url}}
Link secundar: Editează/Anulează participarea → {{dashboard_url}}
Întrebări? Scrie organizatorului din pagina evenimentului.
— UN:EVENT

Adăugat!

F) Solicitare nouă de verificare cont
Subiect: 🪪 Solicitare nouă de verificare cont
Preheader: Utilizator: {{first_name}} — revizuiește documentele.
Conținut:
A fost trimisă o solicitare de verificare pentru utilizatorul {{first_name}}.
Verifică documentele și aprobă/respinge.
CTA: Deschide verificarea → {{dashboard_url}}
— UN:EVENT Admin

