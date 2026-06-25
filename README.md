# Cyna Backend

API REST de la plateforme SaaS de cybersécurité **Cyna**. Construite avec NestJS, MongoDB et Mongoose.

---

## Stack technique

| Outil           | Version | Rôle                                    |
| --------------- | ------- | --------------------------------------- |
| NestJS          | 11.x    | Framework Node.js (modules, DI, pipes…) |
| TypeScript      | 5.x     | Typage statique                         |
| MongoDB         | 7.x     | Base de données NoSQL                   |
| Mongoose        | 9.x     | ODM MongoDB                             |
| JWT             | 11.x    | Authentification (access token)         |
| Stripe          | 22.x    | Paiements en ligne                      |
| Nodemailer      | 7.x     | Envoi d'emails transactionnels          |
| Swagger         | 11.x    | Documentation API auto-générée          |
| Bcrypt          | 6.x     | Hachage des mots de passe               |
| Class-validator | 0.14    | Validation des DTOs                     |

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (inclus avec Node)
- **MongoDB** démarré localement **ou** via Docker (voir section Docker)

---

## Installation

```bash
# 1. Se placer dans le dossier backend
cd cyna_backend

# 2. Installer les dépendances
npm install

# 3. Copier et renseigner les variables d'environnement
cp .env.example .env
```

---

## Lancer en développement

```bash
npm run start:dev
```

L'API est accessible sur <http://localhost:3000/api>.

La documentation Swagger est disponible sur <http://localhost:3000/api/docs>.

---

## Commandes disponibles

| Commande             | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `npm run start:dev`  | Démarre le serveur en mode watch (rechargement automatique) |
| `npm run start:prod` | Démarre le serveur en mode production                       |
| `npm run build`      | Compile le TypeScript dans `dist/`                          |
| `npm run lint`       | Analyse le code avec ESLint                                 |
| `npm run test`       | Lance les tests unitaires                                   |
| `npm run test:cov`   | Lance les tests avec rapport de couverture                  |
| `npm run test:e2e`   | Lance les tests end-to-end                                  |

---

## Variables d'environnement

Copier `.env.example` en `.env` et renseigner les valeurs :

```env
PORT=3000
API_PORT=3000

DATABASE_PASSWORD=change_me
DATABASE_URL=mongodb://root:change_me@mongo:27017/cyna?authSource=admin

ACCESS_TOKEN_SECRET_KEY=change_me
ACCESS_TOKEN_EXPIRE_TIME=1d

APP_BASE_URL=http://localhost:3000

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your_email@example.com
MAIL_PASSWORD=change_me

STRIPE_SECRET_KEY=sk_test_change_me
STRIPE_WEBHOOK_SECRET=whsec_change_me
```

| Variable                      | Usage                    | Obligatoire |
| ----------------------------- | ------------------------ | ----------- |
| `DATABASE_URL`                | URI de connexion MongoDB | Oui         |
| `ACCESS_TOKEN_SECRET_KEY`     | Signature des JWT        | Oui         |
| `STRIPE_SECRET_KEY`           | API Stripe               | Oui (prod)  |
| `MAIL_HOST` / `MAIL_PASSWORD` | Envoi d'emails           | Oui (prod)  |

---

## Structure du projet

```text
cyna_backend/
├── src/
│   ├── features/               # Modules métier
│   │   ├── auth/               # Authentification (register, login, JWT)
│   │   ├── users/              # Gestion des utilisateurs
│   │   ├── products/           # Produits cybersécurité
│   │   ├── categories/         # Catégories de produits
│   │   ├── services/           # Services associés aux produits
│   │   ├── commandes/          # Commandes et abonnements
│   │   ├── carte_bancaires/    # Cartes bancaires (Stripe)
│   │   ├── adresse_facturations/ # Adresses de facturation
│   │   ├── sliders/            # Sliders de la page d'accueil
│   │   ├── contact/            # Formulaire de contact
│   │   └── search/             # Recherche globale
│   ├── shared/                 # Guards, décorateurs, utilitaires partagés
│   ├── stripe/                 # Module Stripe (webhooks, paiements)
│   ├── app.module.ts           # Module racine
│   └── main.ts                 # Point d'entrée (bootstrap NestJS)
├── Dockerfile                  # Build multi-stage (Node 22)
├── docker-compose.yml          # Stack complète (api + MongoDB)
├── .env.example                # Modèle de variables d'environnement
└── nest-cli.json
```

---

## Déploiement avec Docker

Un `Dockerfile` multi-stage est fourni. Il compile le TypeScript puis produit une image de production légère avec uniquement les dépendances nécessaires.

```bash
# Build de l'image
docker build -t cyna-backend:latest .

# Lancer la stack complète (API + MongoDB)
docker compose up -d --build
```

L'API sera accessible sur <http://localhost:3000/api>.

La documentation Swagger sera accessible sur <http://localhost:3000/api/docs>.

Pour exporter l'image (livraison) :

```bash
docker save cyna-backend:latest -o cyna-backend.tar
```
