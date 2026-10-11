# Chiave di firma dell'APK

`debug.keystore` è la chiave di firma **di sviluppo** dell'APK di prova (password standard `android`).
Tenerla nel repository fa sì che ogni build abbia la stessa firma:

- si può aggiornare l'app sopra la versione già installata, senza disinstallarla;
- l'accesso con Google (che riconosce l'app dall'impronta SHA-1 della firma) continua a funzionare.

Non è la chiave per il Play Store: per quella si crea una chiave di caricamento separata e privata.
