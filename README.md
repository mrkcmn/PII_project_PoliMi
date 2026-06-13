# Web-based visualization of conversational interaction design research results


## Guida per l'utente

### Navigazione tra i moduli principali
Gli utenti possono passare agevolmente tra le tre visualizzazioni principali della piattaforma tramite la barra di navigazione orizzontale situata nell'angolo in alto a destra dello schermo:
* **Explore design knowledge** : Questo modulo raggruppa le linee guida trovate nella letteratura in base ai metadati.

* **Explore papers** : Quest'area raggruppa gli articoli accademici in base ai metadati.

* **Paper archive** : Questo è il modulo dell'archivio articoli in cui è possibile esaminare l'intero set di dati in un formato tradizionale a elenco.

### Filtro dei dati ed esplorazione gerarchica
* Nella prima e nella seconda visualizzazione, gli utenti utilizzano i menu a tendina situati direttamente sopra i grafici per raggruppare articoli o linee guida in base alle dimensioni selezionate.

* Quando un utente seleziona una dimensione dal primo menu a tendina, il sistema salva questa selezione, rimuove la dimensione selezionata dalle opzioni negli altri menu a tendina e riorganizza il grafico sottostante in base a questo criterio. 

* L'utente può approfondire o semplificare la struttura gerarchica fino a un massimo di 5 livelli aggiungendo e rimuovendo menu a tendina tramite gli appositi pulsanti.

### Interazione con i grafici a cluster
* **Visibilità:** Il testo molto piccolo nel grafico è nascosto finché non si ingrandisce. Inoltre, le etichette posizionate direttamente sopra i cluster non foglia vengono ritagliate e accorciate se sono troppo lunghe.

* **Animazione di evidenziazione:** Quando il cursore del mouse viene posizionato su un cluster non foglia per più di mezzo secondo, l'etichetta viene evidenziata e ingrandita per essere completamente leggibile se è ritagliata.

* **Cluster interni:** Quando il cursore del mouse viene spostato su cluster foglia molto piccoli, questi vengono ingranditi fino a una dimensione adeguata per mostrare il testo al loro interno.

* **Click su un cluster:** Quando l'utente clicca su un cluster, appare una finestra a comparsa al centro dello schermo. Questa finestra contiene un breve elenco riassuntivo di articoli o linee guida appartenenti a quel gruppo e un pulsante che consente di passare alla visualizzazione "Details".


### Barra laterale
* Quando l'utente seleziona una dimensione dal primo menu a tendina, la barra laterale si aggiorna automaticamente in base alla dimensione selezionata e presenta un riepilogo della distribuzione di articoli o linee guida.

* Se l'utente desidera dedicare più spazio al grafico, può nascondere la barra laterale facendo clic sul pulsante a destra; premendo nuovamente lo stesso pulsante si annulla l'azione.

### Passaggio da Archivio a Dettagli
* Quando si fa clic sulla riga desiderata nell'elenco nella vista "Paper Archive", l'interfaccia passa alla vista "Details" di quell'articolo.

* È possibile tornare all'archivio utilizzando l'apposito pulsante.

---

## Guida all'aggiunta e all'aggiornamento dei dati

Per un corretto funzionamento del sistema nell'elaborazione dei nuovi dati, è necessario seguire le seguenti regole:

1. **Struttura della tabella:** Quando si aggiunge un nuovo articolo, i dati devono essere suddivisi in due tabelle separate.

2. **Creazione dell'ID:** Per ogni articolo deve essere utilizzato un ID univoco di 5 cifre. Quando si aggiunge un nuovo articolo, si consiglia di assegnare un nuovo valore aggiungendo +1 all'ID dell'articolo precedente. Assicurarsi che l'ID utilizzato per i risultati sia lo stesso dell'ID dell'articolo a cui appartiene.

3. **Valori multipli:** Se è necessario inserire più parametri nei campi `Popolazione_Studiata` e `Contributo` nella tabella "paper", ciascun valore deve essere separato da un trattino verticale " | ".

4. **Esportazione e caricamento:** Dopo aver completato le operazioni di inserimento o modifica dei dati, le tabelle devono essere esportate in formato .csv e denominate "paper.csv" e "risultati.csv". Questi file risultanti devono sostituire i vecchi file nella cartella /docs del repository GitHub del progetto; in questo modo il sito verrà aggiornato automaticamente. 

---

## Conformità WCAG e accessibilità

* **Accessibilità visiva e motoria:** Per gli utenti che navigano esclusivamente tramite tastiera, i marcatori di focus sugli elementi interattivi, come i menu a tendina, sono stati resi più evidenti con bordi ad alto contrasto.

* **Supporto per screen reader:** Le aree principali della pagina sono organizzate utilizzando punti di riferimento standard (landmark) che possono essere rilevati direttamente dalle tecnologie assistive. Per garantire un'interpretazione accurata dell'interfaccia, il comportamento e lo stato degli elementi interattivi non testuali e dei componenti complessi sono stati definiti completamente utilizzando ARIA labels.