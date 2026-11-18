# Varco Studio — sito dimostrativo

> **Attività di fantasia.** Varco Studio e i paesi di Pianvecchio e Montebrina non esistono. Nomi, indirizzi,
> telefono, prezzi e capienze sono inventati. Il sito è una demo realizzata da
> [Michele Modica](https://www.modicamichele.it) per mostrare il proprio lavoro.

Demo online: https://gxmich.github.io/varco-studio-demo/

## Cosa mostra la demo

Sito multipagina per uno studio di personal training con due sedi di carattere diverso: una sala grande e
attrezzata e una sala piccola da quattro postazioni.

- **Home** con foto a tutto schermo, scelta rapida della sede, i tre format di allenamento con selettore a schede
  e anteprima dei prezzi.
- **Le sedi**: confronto fra i due studi e una pagina per ciascuno con capienza, galleria e piani.
- **Metodo**: i quattro passi del percorso e i tre format.
- **Prezzi**: listini separati per sede, con navigazione che segue lo scroll.
- **Contatti**: FAQ e **prenotazione simulata** di una prova (sede, giorno, fascia, nome) con riepilogo a schermo.
  Nessun dato viene inviato.
- Menu a schermo intero e barra d'azione fissa su telefono, animazioni che rispettano `prefers-reduced-motion`.
- `noindex, nofollow` su ogni pagina e `robots.txt` con `Disallow: /`.

## Tecnologie

HTML, CSS e JavaScript nativi, senza dipendenze e senza build. Font Big Shoulders Display e Manrope in locale.
Pubblicato con GitHub Pages direttamente dal ramo `main`.

## Avvio in locale

```bash
python -m http.server 8000
```

poi apri http://localhost:8000

## Immagini

Le foto delle sale vengono da Unsplash; le immagini di allenamento in home e nella pagina Metodo sono
illustrazioni generate per la demo e sono indicate come tali. Dettagli in [CREDITI-FOTO.md](CREDITI-FOTO.md).
