# ðŸš€ GUIDE DE DÃ‰PLOIEMENT COMPLET (Full-Stack Cloud Gratuit)

Ce guide rÃ©sume toute la mÃ©thode pour dÃ©ployer une application **Spring Boot (Backend) + MySQL (Base de donnÃ©es) + Angular (Frontend)** gratuitement dans le Cloud, accessible 24h/24 sur PC et Mobile.

---

## ðŸ—ï¸ Architecture Globale

```
ðŸ“± Smartphone / ðŸ’» Ordinateur Client
               â”‚ (HTTPS)
               â–¼
   [ ðŸŒ VERCEL - Frontend Angular ]
               â”‚ (RequÃªtes API REST)
               â–¼
  [ âš™ï¸ RENDER.COM - Backend Spring Boot ]
               â”‚ (Connexion JDBC SSL)
               â–¼
    [ ðŸ—„ï¸ AIVEN.IO - Base MySQL ]
```

---

## 1ï¸âƒ£ Ã‰tape 1 : Pousser le projet sur GitHub

1. Initialiser git et lier le dÃ©pÃ´t distant :
   ```bash
   git init
   git add .
   git commit -m "Projet prÃªt pour production"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/NOM_DU_PROJET.git
   git push -u origin main
   ```

---

## 2ï¸âƒ£ Ã‰tape 2 : CrÃ©er la Base de DonnÃ©es Cloud (sur Aiven.io)

1. Aller sur [Aiven.io](https://console.aiven.io) > **Create Service** > Choisir **MySQL**.
2. SÃ©lectionner le plan gratuit (**Free Tier $0**).
3. Choisir la rÃ©gion la plus proche (ex: *Frankfurt* ou *Europe*).
4. Nommer le service (ex: `sales-db`) et cliquer sur **Create Service**.
5. Une fois le statut en **`Running`** (vert), copier les informations de connexion :
   - **Host** : `mysql-xxxx.aivencloud.com`
   - **Port** : `25505` (ou similaire)
   - **User** : `avnadmin`
   - **Password** : *(cliquer sur l'Å“il pour afficher/copier)*
   - **Database** : `defaultdb`

---

## 3ï¸âƒ£ Ã‰tape 3 : DÃ©ployer le Backend Spring Boot (sur Render.com)

1. Aller sur [dashboard.render.com](https://dashboard.render.com) > **New +** > **Web Service**.
2. Connecter le dÃ©pÃ´t GitHub.
3. Remplir la configuration :
   - **Name** : `cahier-de-vente-backend`
   - **Root Directory** : `backend`
   - **Runtime** : `Docker` *(Utilise le Dockerfile avec `maven:3.9-eclipse-temurin-21-alpine`)*
   - **Instance Type** : `Free`
4. Ajouter les **Environment Variables** :
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://VOTRE_HOST:VOTRE_PORT/defaultdb?useSSL=true&requireSSL=true&serverTimezone=UTC`
   - `SPRING_DATASOURCE_USERNAME` = `avnadmin`
   - `SPRING_DATASOURCE_PASSWORD` = `VOTRE_MOT_DE_PASSE_AIVEN`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
5. Cliquer sur **Create Web Service**.
6. Une fois le statut en **`Live`** (vert), copier l'URL gÃ©nÃ©rÃ©e :
   ðŸ‘‰ `https://cahier-de-vente-backend.onrender.com`

---

## 4ï¸âƒ£ Ã‰tape 4 : Configurer et DÃ©ployer le Frontend (sur Vercel.com)

### A. Dans le code Angular :
1. Dans `src/environments/environment.prod.ts` et `src/app/services/vente.service.ts` :
   Mettre l'URL de votre backend Render :
   ```typescript
   apiUrl: 'https://cahier-de-vente-backend.onrender.com/api/ventes'
   ```
2. VÃ©rifier que `vercel.json` est prÃ©sent dans le dossier `frontend/` pour rediriger les routes SPA :
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
3. Pousser sur GitHub :
   ```bash
   git add .
   git commit -m "Update API URL for Vercel"
   git push origin main
   ```

### B. Sur Vercel :
1. Aller sur [Vercel.com](https://vercel.com) > **Add New...** > **Project** > Importer votre dÃ©pÃ´t.
2. ParamÃ¨tres de configuration :
   - **Root Directory** : Cliquer sur Edit et choisir `frontend`.
   - **Framework Preset** : `Angular`.
   - **Build and Output Settings** :
     - Activer **Output Directory** (Override ON) et mettre : `dist/frontend/browser`.
3. Cliquer sur **Deploy**.
4. Vercel gÃ©nÃ¨re votre lien en ligne public HTTPS :
   ðŸ‘‰ `https://cahier-de-vente.vercel.app`

---

## âš ï¸ Les 4 PiÃ¨ges & Bonnes Pratiques Ã  retenir

1. **Le rÃ©veil du serveur gratuit Render (Cold Start)** :
   Sur le plan gratuit de Render, aprÃ¨s 15 minutes sans visite, le serveur se met en veille. Au premier clic de la journÃ©e, il met ~30 Ã  50 secondes Ã  se rÃ©veiller, puis redevient ultra-rapide.

2. **CORS (Cross-Origin Resource Sharing)** :
   Dans Spring Boot (`CorsConfig.java`), toujours autoriser `allowedOriginPatterns("*")` pour que le domaine Vercel puisse appeler le domaine Render.

3. **Output Directory Angular** :
   Sur Vercel, toujours spÃ©cifier `dist/NOM_PROJET/browser` (et non juste `dist`).

4. **Installer sur Smartphone comme une Application** :
   Ouvrir le lien Vercel sur Chrome/Safari mobile > Menu (3 points) > **Ajouter Ã  l'Ã©cran d'accueil**.