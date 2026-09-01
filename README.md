# Bikepacking — LF Waterlinieroute, 19–21 september

Statische pagina met het volledige reisdossier: draaiboek per dag, route,
veerpont, overnachtingen, treinkaartjes en een afvinkbare paklijst.

## Structuur

    index.html        de hele site, één bestand
    api/state.js      serverless route die de paklijst-stand bewaart
    package.json      dependency @vercel/blob

## Sync tussen toestellen

`api/state.js` schrijft de aangevinkte items naar een Vercel Blob-store.
Voorwaarde: een Blob-store gekoppeld aan dit project, zodat Vercel de
environment variable `BLOB_READ_WRITE_TOKEN` injecteert.

Storage → Create Database → Blob → Connect to Project → bikepacking.
Daarna één keer opnieuw deployen.

Zonder store blijft de site werken: `api/state.js` geeft dan 501 terug en
de pagina valt automatisch terug op opslag in de browser zelf.

De browser maakt bij het eerste bezoek een willekeurige sleutel aan en
bewaart die lokaal. Onderaan de paklijst staat een koppellink met die
sleutel in de hash — open die op je telefoon en beide toestellen delen
dezelfde lijst.

## GPX

De dagetappes staan los in de map `gpx/` als je ze toevoegt:
Edam → Naarden (138,5 km), Naarden → Fort Bakkerskil (143,6 km),
Fort Bakkerskil → Bergen op Zoom (122,5 km).
