# ðŸ›’ Application Digitalisation Cahier de Vente Magasin

Application complÃ¨te sur mesure (Spring Boot 3 + MySQL + Angular 22 + PrimeNG + PrimeFlex) pour digitaliser et automatiser la tenue du cahier de ventes et bÃ©nÃ©fices du magasin.

---

## ðŸ“‹ FonctionnalitÃ©s DÃ©veloppÃ©es

1. **Saisie Ultra-Rapide (Format Cahier Journalier)** :
   - Formulaire ergonomique en haut de page avec focus automatique et validation directe par la touche **EntrÃ©e**.
   - Champs : **DÃ©signation du produit** (ex: `1 MACLA`, `1 1202`, `1 BASA`), **Montant vendu**, **BÃ©nÃ©fice rÃ©alisÃ©**.
   - Tableau dynamique rÃ©capitulant les ventes de la journÃ©e avec calcul automatique en temps rÃ©el :
     - **Chiffre d'Affaires total du jour**
     - **BÃ©nÃ©fice total net rÃ©alisÃ©** (surlignÃ© en vert comme le total encerclÃ© sur votre cahier physique `= 98450` ou `= 81500`)
     - **Taux de marge (%)** et nombre d'articles vendus.
   - PossibilitÃ© de modifier ou supprimer une ligne en un clic.

2. **ClÃ´ture de JournÃ©e** :
   - Bouton **"ClÃ´turer la journÃ©e"** pour verrouiller les ventes du jour une fois le magasin fermÃ©.
   - Option de **RÃ©ouverture** si un ajustement est nÃ©cessaire.

3. **Rapports PÃ©riodiques & Facturation** :
   - Vues : **JournaliÃ¨re**, **Hebdomadaire** (cette semaine), **Mensuelle** (ce mois), **Annuelle** (cette annÃ©e) ou **Plage personnalisÃ©e** (Du ... Au ...).
   - **Graphique interactif** (PrimeNG Chart) d'Ã©volution des ventes et gains journaliers/mensuels.
   - **Facture / Rapport imprimable** avec bouton **"Imprimer Facture / Rapport"** prÃªt pour impression papier ou export PDF.

4. **Historique des JournÃ©es** :
   - Liste de toutes les dates enregistrÃ©es avec statut (Ouvert / ClÃ´turÃ©) et accÃ¨s instantanÃ© Ã  n'importe quelle journÃ©e passÃ©e.

---

## ðŸ—„ï¸ Base de DonnÃ©es MySQL

- **Base** : `sales_db`
- **Table** : `lignes_vente`
- **Fichier de configuration** : `backend/src/main/resources/application.properties`
  - URL par dÃ©faut : `jdbc:mysql://localhost:3306/sales_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
  - Utilisateur : `root` (mot de passe vide par dÃ©faut, modifiable dans le fichier si votre MySQL a un mot de passe).
- **Script SQL d'import manuel (si besoin)** : `backend/schema.sql`.

---

## ðŸš€ Comment Lancer l'Application

### Option 1 : En un clic (Fichiers batch sur le Bureau)
- Double-cliquez sur `start-all.bat` dans le dossier `sales-book-app` sur votre Bureau.

### Option 2 : En ligne de commande
1. **Lancer le Backend (Spring Boot)** :
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
2. **Lancer le Frontend (Angular)** :
   ```bash
   cd frontend
   npm start
   ```
3. Ouvrez votre navigateur sur : **[http://localhost:4200](http://localhost:4200)**.