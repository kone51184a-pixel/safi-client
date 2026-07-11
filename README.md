# SAFi Client — Interface web (restaurants / particuliers)

Application web pour passer commande sur SAFi : catalogue, panier, demande libre, suivi de commande.

## Installation

### 1. Prérequis
- Le backend `safi-backend` doit tourner sur `http://localhost:5000`

### 2. Installer et lancer
```bash
cd safi-client
npm install
npm run dev
```

Vite te donne une adresse (généralement `http://localhost:5174` si l'admin tourne déjà sur 5173 — Vite change de port automatiquement si le premier est pris).

## Parcours disponibles (MVP)

- **Inscription / Connexion** — restaurant ou particulier
- **Accueil** — catégories + produits mis en avant + accès rapide à la demande libre
- **Catalogue** — recherche, liste des produits avec vendeur associé
- **Fiche produit** — détail, choix de quantité, ajout au panier
- **Panier** — état local (en mémoire, pas encore persistant en base tant que la commande n'est pas passée)
- **Demande libre** — formulaire pour les besoins hors catalogue (matché ensuite par l'équipe admin)
- **Commande / Paiement** — choix Orange Money / Moov Money / à la livraison (le paiement réel sera branché en phase 2, pour l'instant la commande est juste enregistrée)
- **Confirmation**
- **Mes commandes** — liste + détail avec timeline de suivi

## Important : trois projets tournent ensemble

Pour tout tester, il faut avoir en même temps, dans trois terminaux séparés :
1. `safi-backend` → `npm run dev` (port 5000)
2. `safi-admin` → `npm run dev` (port 5173)
3. `safi-client` → `npm run dev` (port 5174 ou autre indiqué par Vite)

## Ce qui reste à faire (phase 2)
- Vraie intégration paiement (CinetPay/PayDunya)
- Gestion des adresses de livraison sauvegardées (actuellement juste un champ texte au checkout)
- App mobile Flutter (même parcours, pour un usage terrain plus pratique pour les restaurateurs)
- Notifications en temps réel sur le changement de statut de commande
