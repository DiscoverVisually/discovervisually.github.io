# UI Remake Research & Návrh (Landing + Category Sales Pages)

## 1) Cieľ redizajnu (čo optimalizujeme)

- **Primárny cieľ homepage:** rýchlo presmerovať návštevníka do správnej kategórie (nie prehliadanie jednotlivých kníh).
- **Primárny cieľ category page:** konvertovať traffic z TikToku cez jasný príbeh, vizuálnu relevanciu, dôveru a silné CTA.
- **Informačná architektúra:** homepage = orientácia + výber kategórie; category page = predajná stránka; produkt detail = iba pre používateľov, ktorí chcú detail.
- **Milestone cards:** evidovať ako samostatnú kategóriu, bez špeciálneho zvýraznenia oproti ostatným.

## 2) Research zhrnutie (UX závery, ktoré majú priamy dopad)

### A) Intermediary category page funguje lepšie pri väčšom katalógu
- Baymard potvrdzuje, že pri väčšej ponuke je medzikrok s kategóriami užitočný a na mnohých weboch stále chýba.
- Dôležité je, aby **subkategórie/kategórie boli primárny obsah nad foldom**, nie sekundárny prvok pod bannermi.

**Dopad pre teba:** Homepage a top-level kategórie musia byť navrhnuté ako **navigačné huby** s výraznými category cards, nie ako random grid kníh.

### B) CTA-first štruktúra + nízka kognitívna záťaž
- Silné landing stránky majú 1 primárny cieľ na sekciu, jasnú hierarchiu, krátke texty a opakované CTA v logických bodoch.
- Zbytočné rušivé elementy, dlhé úvody a slabý kontrast CTA typicky znižujú konverziu.

**Dopad pre teba:** Každá category page má mať 1 dominantné CTA („Objednať“, „Vybrať variant“, „Pozrieť ukážky“) a sekundárne CTA („Pozrieť recenzie“, „Časté otázky“).

### C) TikTok traffic potrebuje okamžitý „message match"
- Social traffic prichádza s nízkou trpezlivosťou a vysokým očakávaním vizuálnej kontinuity.
- Keď kreatíva v reklame/biu vizuálne alebo textovo nesedí s cieľovou stránkou, rastie bounce rate.

**Dopad pre teba:** Na category page musí byť hero obraz, headline a tón, ktorý explicitne nadväzuje na konkrétnu TikTok kreatívu/claim.

## 3) Odporúčaná IA (information architecture)

## Globálne
1. **Homepage (/)** = category selector + trust + quick intent routing
2. **Category pages (/kategoria/{slug})** = full sales page per kategória
3. **Product pages** = detail + varianty + checkout path

## Homepage sekcie
1. Hero s value proposition + 2 CTA
2. Kategórie (hlavný blok)
3. „Ako to funguje" (3 kroky)
4. Sociálny dôkaz (UGC/reviews)
5. FAQ mini + finálne CTA

## Category page sekcie (predajný funnel)
1. Hero (vizuál + headline + CTA)
2. Pre koho je to (segmentácia)
3. Produktové varianty / bestsellers danej kategórie
4. Benefity (emocionálne + praktické)
5. Dôkazy (recenzie, fotky, počty objednávok)
6. Námietky (FAQ, doprava, čas doručenia)
7. Sticky/final CTA

## 4) UI systém (aby všetko pôsobilo ako 1 značka)

## Shared design system (konzistentná kostra)
- Rovnaká mriežka, spacing scale, typografia, komponenty (button, cards, badges, reviews, FAQ).
- Rovnaké interakcie (hover, focus, transitions), dostupnosť (kontrast, veľké touch targety).
- Rovnaká navigácia a footer.

## Category theming layer (odlišnosť podľa emócie)
- Každá kategória dostane **vlastný visual skin**:
  - farebná paleta,
  - ilustrácie/fotografie,
  - shape language (zaoblenie, ornamentika),
  - tón textov.
- Stránka tak zostane „jedna značka“, ale kategórie budú výrazne odlišné.

### Príklad mood boardov
- **Detské:** teplé veselé farby, jemné ilustrácie, hravé ikony, rounded cards, viac whitespace.
- **Spirituálne:** tlmenejšia elegantná paleta, pokojné textúry, serif akcent titulkov, pomalšie/jemné animácie.
- **Milestone cards:** neutrálne produktové vizuály, rovnaká priorita ako ostatné kategórie.

## 5) Homepage wireframe (CTA-oriented, category-first)

- **Top bar:** doprava/garancia info + trust microcopy.
- **Hero:**
  - H1: „Nájdi kategóriu, ktorá sadne presne tvojmu dieťaťu/rodine."  
  - Subheadline: 1 veta value.
  - CTA 1 (primary): „Prejsť do kategórií"
  - CTA 2 (secondary): „Pozrieť bestsellery"
- **Category grid (core):** veľké vizuálne cards (2–6), každá card:
  - cover visual,
  - krátky benefit,
  - CTA „Objaviť kategóriu".
- **Trust strip:** recenzie, počet objednávok, rýchlosť dopravy.
- **How it works:** 3 kroky.
- **FAQ mini + final CTA.**

## 6) Category sales page wireframe (TikTok ready)

- **Above the fold (do 3 sekúnd):**
  - headline s jasným outcome,
  - krátky „pre koho",
  - 1 dominantné CTA,
  - hero vizuál konzistentný s reklamou.
- **Proof block:** UGC fotky/videá, hviezdičky, krátke citácie.
- **Product chooser:** varianty/vekové skupiny/edície.
- **Benefit stack:** 3–5 benefitov, nie feature dump.
- **Risk reversal:** garancia, doprava, vratky, termíny.
- **FAQ:** iba kritické námietky.
- **Sticky CTA na mobile.**

## 7) UX detaily s najvyšším dopadom

- Mobil-first (TikTok audience): sticky CTA, rýchly load, menšie bloky textu.
- Vizuálny kontrast CTA (jedna primárna farba CTA naprieč webom).
- Krátke mikrocopy pri tlačidlách (čo sa stane po kliku).
- Jasné breadcrumbs + späť na kategórie.
- Žiadne autoplay karusely v hero (skôr statický silný vizuál).
- Každá stránka max 1 primárny cieľ.

## 8) KPI framework (aby si vedel, či redesign funguje)

- Homepage → category CTR
- Category page → ATC / checkout start rate
- TikTok landing bounce rate
- Scroll depth po sekciách
- CTA click heatmap (hero vs lower page)
- Conversion rate per category theme

## 9) Implementačný plán (milestones)

1. **Discovery + IA freeze (1 týždeň)**
   - finalizácia taxonómie kategórií,
   - mapping TikTok kreatív → category page message.
2. **Design system + 2 referenčné kategórie (1–2 týždne)**
   - base komponenty,
   - theme tokeny pre detské + spirituálne.
3. **Homepage + všetky category templates (1–2 týždne)**
   - CTA-first layout,
   - proof/FAQ/chooser moduly.
4. **QA + A/B test (2 týždne)**
   - test headline/hero/CTA variánt,
   - optimalizácia podľa dát.

## 10) Konkrétne rozhodnutia pre tvoje zadanie

- Landing page nebude book-grid; bude **category-first navigačný funnel**.
- Najväčší dôraz ide do category pages (top sales pages pre TikTok).
- Milestone cards ostávajú len ako samostatná kategória bez extra promo priorít.
- Vizuálne odlíšenie kategórií sa rieši cez tematický skin nad spoločným design systemom.

## Otázky na doplnenie pred realizáciou UI návrhu (kritické)

1. Aké sú presné názvy všetkých hlavných kategórií (a ich priorita podľa tržieb)?
2. Máš už existujúce brand pravidlá (farby, fonty, logo varianty), alebo to nastavíme nanovo?
3. Ktoré 2 kategórie majú dostať prioritu v prvej vlne (odporúčanie: detské + spirituálne)?
4. Vieš zdieľať top 3 TikTok kreatívy, z ktorých bude chodiť traffic (kvôli message match)?
5. Aké máš momentálne conversion dáta (aspoň baseline): homepage CTR do kategórií, ATC rate, bounce?

