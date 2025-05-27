# Données de Test pour Validation - Module Gestion Comptable

## 🎯 Objectif
Ce document fournit des données d'exemple pour tester rapidement toutes les fonctionnalités du module Gestion Comptable.

---

## 📊 Plan Comptable de Test

### Comptes à Créer (dans l'ordre)

#### **Classe 1 - Capitaux**
```
101000 | Capital social | passif | 50000
106000 | Réserves | passif | 10000
120000 | Résultat de l'exercice | passif | 0
```

#### **Classe 2 - Immobilisations**
```
211000 | Terrains | actif | 100000
213000 | Constructions | actif | 80000
218000 | Autres immobilisations corporelles | actif | 15000
```

#### **Classe 3 - Stocks**
```
310000 | Matières premières | actif | 5000
370000 | Marchandises | actif | 8000
```

#### **Classe 4 - Tiers**
```
401000 | Fournisseurs | passif | 12000
411000 | Clients | actif | 15000
421000 | Personnel | passif | 3000
445000 | État - TVA | passif | 2000
```

#### **Classe 5 - Financier**
```
512000 | Banque | actif | 25000
530000 | Caisse | actif | 1000
```

#### **Classe 6 - Charges**
```
601000 | Achats matières premières | charge | 0
611000 | Sous-traitance générale | charge | 0
621000 | Personnel extérieur | charge | 0
641000 | Rémunérations du personnel | charge | 0
661000 | Charges d'intérêts | charge | 0
```

#### **Classe 7 - Produits**
```
701000 | Ventes de marchandises | produit | 0
706000 | Prestations de services | produit | 0
761000 | Produits financiers | produit | 0
```

---

## 📝 Écritures Comptables de Test

### **Écriture 1 : Vente de marchandises**
```
Date : 01/01/2025
Libellé : Vente marchandises client ABC
Lignes :
- 411000 (Clients) | Débit : 1200€
- 701000 (Ventes marchandises) | Crédit : 1000€
- 445000 (TVA) | Crédit : 200€
```

### **Écriture 2 : Achat matières premières**
```
Date : 02/01/2025
Libellé : Achat matières premières
Lignes :
- 601000 (Achats MP) | Débit : 800€
- 445000 (TVA) | Débit : 160€
- 401000 (Fournisseurs) | Crédit : 960€
```

### **Écriture 3 : Paiement salaires**
```
Date : 05/01/2025
Libellé : Paiement salaires janvier
Lignes :
- 641000 (Rémunérations) | Débit : 3000€
- 421000 (Personnel) | Crédit : 2400€
- 445000 (TVA/Charges sociales) | Crédit : 600€
```

### **Écriture 4 : Encaissement client**
```
Date : 10/01/2025
Libellé : Encaissement client ABC
Lignes :
- 512000 (Banque) | Débit : 1200€
- 411000 (Clients) | Crédit : 1200€
```

### **Écriture 5 : Prestation de service**
```
Date : 15/01/2025
Libellé : Prestation conseil entreprise XYZ
Lignes :
- 411000 (Clients) | Débit : 2400€
- 706000 (Prestations) | Crédit : 2000€
- 445000 (TVA) | Crédit : 400€
```

---

## 🧪 Scénarios de Test Complets

### **Scénario 1 : Test Basique (15 min)**

1. **Créer 5 comptes minimum** :
   - 411000 | Clients | actif
   - 701000 | Ventes | produit
   - 601000 | Achats | charge
   - 401000 | Fournisseurs | passif
   - 512000 | Banque | actif

2. **Créer 2 écritures** :
   - Vente : Client 1000€ / Vente 1000€
   - Achat : Achat 500€ / Fournisseur 500€

3. **Tester rapports** :
   - Journal : Voir les 2 écritures
   - Balance : Vérifier équilibre
   - Résultat : Voir bénéfice 500€

### **Scénario 2 : Test Complet (30 min)**

1. **Créer tous les comptes** (liste ci-dessus)
2. **Saisir toutes les écritures** (5 écritures ci-dessus)
3. **Tester tous les rapports** :
   - Dashboard : KPIs et graphiques
   - Journal : Chronologie complète
   - Grand Livre : Détail compte 411000
   - Balance : Tous les soldes
   - Bilan : Structure actif/passif
   - Résultat : Charges/produits
   - Cash Flow : Flux de trésorerie
   - Ratios : Calculs financiers
   - Comparatifs : Évolutions

### **Scénario 3 : Test Avancé (45 min)**

1. **Données complètes** + **Écritures supplémentaires** :
   - 10 écritures minimum
   - Tous types de comptes utilisés
   - Plusieurs mois de données

2. **Tests d'erreur** :
   - Écriture déséquilibrée
   - Suppression compte utilisé
   - Données invalides

3. **Tests de performance** :
   - Export PDF tous rapports
   - Filtrage par période
   - Navigation rapide

---

## 📋 Checklist de Validation Rapide

### ✅ **Phase 1 : Données de Base (5 min)**
- [ ] Créer 5 comptes essentiels
- [ ] Vérifier affichage dans liste
- [ ] Tester modification d'un compte

### ✅ **Phase 2 : Écritures (10 min)**
- [ ] Créer écriture équilibrée
- [ ] Tester validation déséquilibre
- [ ] Vérifier affichage dans journal

### ✅ **Phase 3 : Rapports Standards (10 min)**
- [ ] Journal : Chronologie OK
- [ ] Balance : Équilibre OK
- [ ] Bilan : Structure OK
- [ ] Résultat : Calcul OK

### ✅ **Phase 4 : Dashboard (5 min)**
- [ ] KPIs affichés
- [ ] Graphique visible
- [ ] Actions rapides fonctionnelles

### ✅ **Phase 5 : Rapports Avancés (15 min)**
- [ ] Cash Flow : 3 sections
- [ ] Ratios : 4 catégories
- [ ] Comparatifs : Variances
- [ ] Exports PDF

---

## 🎯 Résultats Attendus

### **Après Scénario 1** :
- Balance équilibrée : 3500€ débit = 3500€ crédit
- Résultat positif : 500€ (1000€ ventes - 500€ achats)
- Bilan équilibré : Actif = Passif

### **Après Scénario 2** :
- 17 comptes créés
- 5 écritures saisies
- Tous rapports générés sans erreur
- Dashboard avec données réelles

### **Indicateurs de Succès** :
- ✅ Aucune erreur console
- ✅ Tous les totaux équilibrés
- ✅ Navigation fluide
- ✅ Exports fonctionnels
- ✅ Données cohérentes entre rapports

---

## 🚨 Points de Vigilance

### **Erreurs Communes** :
1. **Déséquilibre** : Toujours vérifier débit = crédit
2. **Types de comptes** : Respecter actif/passif/charge/produit
3. **Numéros de comptes** : Utiliser plan comptable français
4. **Dates** : Format cohérent DD/MM/YYYY

### **Validation Finale** :
- [ ] Balance générale équilibrée
- [ ] Bilan équilibré (Actif = Passif)
- [ ] Résultat cohérent (Produits - Charges)
- [ ] Cash Flow avec flux nets calculés
- [ ] Ratios avec valeurs réalistes
- [ ] Comparatifs avec variances correctes

---

## 📞 Aide Rapide

### **Problème de données** :
```sql
-- Vérifier comptes en base
db.comptecomptables.find()

-- Vérifier écritures
db.ecriturecomptables.find()
```

### **Problème technique** :
1. Redémarrer backend : `npm start`
2. Vider cache navigateur : Ctrl+F5
3. Vérifier console : F12
4. Tester API directement : `http://localhost:4000/comptes`

**🎉 Module validé si tous les scénarios passent avec succès !**
