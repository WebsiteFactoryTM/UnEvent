# 📄 PRD: Unverified Listings & Claim Flow — UnEvent

## tl;dr

We want to support the public listing of venues, services, and events that were added by the UnEvent team or through semi-automated processes — even if they’re not yet claimed by a business owner. These listings are shown on the site with a **"Unverified"** badge and offer a clear way for real owners to claim them. Once claimed and approved, the listing is transferred to the user’s account, and they can manage or delete it.

---

## 🎯 Goals

### Business Goals
- Accelerate content growth by allowing listings to be published without waiting for user input.
- Drive user acquisition by converting passive listings into active owners via the claim flow.
- Improve data quality by letting verified owners manage their own listings.

### User Goals
- Discover listings even if not yet claimed.
- Easily claim ownership of a listing if it belongs to them.
- Get notified when a listing they own is published and manage it without needing to create it from scratch.

### Non-Goals
- No claiming required or possible for listings created directly by registered users.
- We are not allowing random users to edit unclaimed listings directly.

---

## 👤 User Stories

- As a visitor, I want to see the location/event/service, even if it’s not yet verified.
- As a business/service/event owner, I want to claim an unverified listing and manage it under my account.
- As an admin, I want to be notified of new claim requests and approve/reject them.
- As a system, I want to notify users by email when their claim is approved.

---

## 🧭 User Experience

### For all users:
- Listings created by UnEvent are shown on the site with a **"Unverified"** badge.
- A clear CTA is shown:  
  > “Are you the owner / provider / organizer?”  
  Text dynamically changes based on the listing type (venue, service, event).

### Claim flow (via website):
1. **Click on CTA → Claim Form**
   - Pop-up or redirect to a dedicated claim page.
   - User provides their **email** (and optionally name/phone).
   - Submits the claim.

2. **Account creation / login**
   - If no account exists, the user is redirected to the signup page.
   - The listing ID is remembered.
   - Upon successful signup, the system associates the claim with the new account.

3. **Claim Pending / Approval**
   - The claim is marked as "pending".
   - Admins are notified and can approve or reject from the backend.

4. **Post-approval**
   - The listing is now owned by the user.
   - The user sees it in their dashboard and can edit or delete it.
   - The "Unverified" badge is removed.

### Claim flow (via email):
- If UnEvent team adds a listing and includes a contact email, the system sends an email once the listing is live.
- The email includes:
  - A preview of the listing
  - A button: “Claim this listing”
  - A secure link that leads to the claim process (or account creation if needed)
  - Once claimed, same flow as above applies.

---

## 📧 Email Trigger Template (Claim Approval)

**Trigger:** When a claim is approved by moderators.

**To:** The email address used during claim OR the email in the listing’s contact info.

**Subject:** 🎉 Your listing on UnEvent has been verified

**Body:**  


EMAIL TEMPLATE for claim invitation: 

Subject:
🚀 Am listat [Titlu listare] pe UN:EVENT 

Message:
Salutare,

Îți scriu pentru că echipa noastră a selectat [Titlu listare] drept una dintre locațiile/serviciile de top pe care le recomandăm pe UN:EVENT – noua platformă digitală dedicată organizării de evenimente din România.

Pe scurt: Nu îți vindem nimic. Ți-am creat deja o prezență gratuită.

Pentru că ne dorim ca utilizatorii noștri (mirese, organizatori de evenimente, petrecăreți) să găsească cele mai bune opțiuni din piață, am luat inițiativa de a crea un profil preliminar pentru voi.

În acest moment, profilul vostru folosește o imagine generică și informații publice de bază. Știm că realitatea arată mult mai bine decât o fotografie stock, iar clienții vor să vadă exact ce oferiți.

💡 Soluția (Durează 2 minute): Am creat un buton special prin care poți deveni oficial "proprietarul" acestui profil. Îți oferim acces complet pentru a:

Șterge poza generică și a încărca fotografiile voastre reale.

Actualiza descrierea și prețurile (dacă dorești).

Primi cereri de ofertă direct de la clienți.

Este complet gratuit să îți revendici profilul și să fii listat pe UN:EVENT.

[ BUTON: Revendică Profilul ] (link: creare cont cu ce transfera id-ul catre el)

De ce UN:EVENT? Suntem aici să digitalizăm industria. Ne-am propus să simplificăm modul prin care organizatorii își planifică întregul eveniment, de la locație la ultimul detaliu logistic. Fii alături de noi în această călătorie.

Așteptăm să vedem profilul vostru strălucind!

Cu drag, 
Ernest Slach
Fondator UN:EVENT