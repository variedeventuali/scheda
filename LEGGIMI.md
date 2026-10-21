# Scheda Palestra: appunti del progetto

Stato al 21 ottobre 2026. Versione dell'app: 1.2.

## Cos'è
Una web app installabile su Android (PWA) per seguire le schede di allenamento di Michele e di Vale Chela. Un solo file `index.html`, nessun server: i dati restano sul telefono e si sincronizzano tra più telefoni tramite un repository GitHub privato.

Funzioni:
- Due profili (Michele, Vale Chela), ognuno con la propria scheda, i propri kg e il proprio storico.
- Fasi con contatore di settimane: si resta in una fase quanto serve, si passa alla successiva a mano.
- Allenamenti con spunta delle serie, kg per esercizio (con l'ultimo carico già compilato) e timer di recupero con suono e vibrazione.
- Editor della scheda: fasi, allenamenti, esercizi, note, circuiti (Fasi, poi Modifica).
- Storico con grafico dei progressi dei kg per esercizio; ogni sessione si apre e mostra esercizi fatti, parziali e non fatti (dalla 1.2).
- Sincronizzazione tra telefoni, avviso "Vuoi uscire?" con il tasto indietro, versione e scadenza del token in fondo alla pagina.

## Dove sta tutto
- Account GitHub: `variedeventuali` (dedicato solo a questo progetto).
- Repository pubblico `scheda`: contiene i file della cartella `sito/`. Il sito è pubblicato con GitHub Pages (Settings, Pages, branch `main`, cartella root) all'indirizzo `https://variedeventuali.github.io/scheda/`.
- Repository privato `scheda-dati`: contiene solo `scheda-palestra-dati.json`, creato dall'app alla prima sincronizzazione. Va creato con un README iniziale.
- Token di accesso (non è salvato in questa cartella): fine-grained con accesso solo a `scheda-dati` e permesso Contents "Read and write", oppure classico con scope `repo`. Si incolla nell'app: schermata iniziale, Sincronizzazione. Resta salvato solo su quel telefono. Quando scade bisogna crearne uno nuovo e reinserirlo.

## Contenuto della cartella
- `sito/`: i 6 file da caricare su `scheda` (`index.html`, `manifest.webmanifest`, `sw.js`, tre icone PNG).
- `test/`: script di prova automatici (richiedono Node e `npm install jsdom`; si lanciano con `node test/nome.js` dalla cartella principale). Non servono per usare l'app.

## Come aggiornare l'app
1. Modifica `index.html` (o fatti dare il file nuovo da Claude).
2. Su GitHub apri `scheda`, Add file, Upload files, trascina il file con lo stesso nome, Commit changes. Messaggio suggerito: `Versione X.Y: cosa è cambiato`.
3. GitHub Pages aggiorna il sito in 1-2 minuti (si vede in Actions).
4. Sui telefoni la versione nuova compare alla seconda apertura dell'app. In fondo alla pagina c'è il numero di versione. Non cancellare i dati del sito da Chrome per forzare l'aggiornamento.
Cambiando `index.html` ricordati di aggiornare `APP_VERSION` dentro il file.

## Come si installa su un telefono
Apri il link in Chrome, menu con i tre puntini, Installa app (o Aggiungi a schermata Home). Poi nell'app: schermata iniziale, Sincronizzazione, Imposta, `variedeventuali/scheda-dati`, incolla il token, Salva. Sul secondo telefono attiva la sincronizzazione prima di usare l'app.

## Come funzionano i dati
- Nel telefono: localStorage del browser, chiavi `gym-state` (Michele), `gym-state-lei` (Vale Chela), `gym-sync` (repository e token), `gym-draft` e `gym-draft-lei` (serie spuntate dell'allenamento di oggi, non sincronizzate).
- Sincronizzazione: un solo file JSON nel repository dati, aggiornato con l'API di GitHub. Parte all'apertura, tre secondi dopo ogni modifica, quando l'app torna in primo piano e quando torna la rete.
- Unione: lo storico si unisce senza perdite; per scheda, kg, fase e settimane vince l'ultima modifica. "Azzera storico" cancella lo storico anche sugli altri telefoni.
- Il repository dati conserva la cronologia delle versioni: in caso di errore si può tornare indietro da GitHub. Il backup su file è stato tolto su richiesta.

## Le schede contenute
- Michele (trascritte dalle foto del foglio, kg scritti a penna inclusi): fase 1 Full Body (due schede più Crossfit), fase 2 Piramidali (A, B, C), fase 3 Serie da 50 (A, B, C), fase 4 Forza e volume (A, B, C, D). Le barrature sul foglio sono state ignorate. I finali (addominali o HIIT) sono dentro ogni allenamento.
- Vale Chela (trascritta dal PDF): una fase con Giorno A, B e C.
Da confermare con lei: recuperi (messi 90 secondi, 60 per gli addominali, non erano nel PDF), trazioni con ripetizioni "da definire", affondi bulgari a 6 kg (nel PDF c'è anche "25.4"), settimane consigliate (4 come segnaposto). Le evidenziature colorate del PDF sono ignorate. Tutto si corregge dall'editor nell'app.

## Cronologia versioni
- Prima pubblicazione: app installabile, sincronizzazione GitHub, editor, profili.
- 1.1: tolto il backup su file; versione e scadenza token in fondo alla pagina.
- 1.2: sessioni cliccabili con dettaglio degli esercizi; corretto l'orario di fine allenamento che veniva sovrascritto (influiva sul dopo "Azzera storico").

## Limiti noti
- Due telefoni che cambiano la scheda nello stesso momento: vince l'ultima modifica.
- Il dettaglio delle sessioni esiste solo per gli allenamenti conclusi dalla 1.2.
- La lettura automatica della scadenza del token da GitHub non è stata verificata con GitHub vero; si può scrivere la data a mano nelle impostazioni.
- Senza sincronizzazione attiva i dati stanno solo nel telefono: se si cancellano i dati di Chrome si perdono.
- L'app è stata provata con test automatici su un browser simulato, non su un telefono vero.

## Per riprendere il lavoro con Claude
Allega `sito/index.html` e questo file e scrivi, per esempio: "Ho un'app web Scheda Palestra (HTML unico, versione 1.2, allegata). Leggi gli appunti nel LEGGIMI e fai questa modifica: ...". Poi carica i file nuovi su GitHub come sopra.
Idee non ancora fatte: note libere per allenamento, grafici dei progressi, timer di recupero modificabile, ricerca tra gli esercizi, recupero selettivo per profilo.
