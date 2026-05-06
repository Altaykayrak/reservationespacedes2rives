
## Modification du sujet d'email pour les CM2

### Fichier à modifier
`supabase/functions/send-reservation-email/holiday.ts`

### Changement
Ajouter une variable `isCM2` basée sur `requestData.childClass` (avec `trim().toUpperCase() === 'CM2'`), puis modifier la construction de `emailSubject` :

- Si `isCM2` → `"Nouvelle réservation - Club Ado - [childName]"`
- Sinon → conserver la logique actuelle inchangée

### Détail technique

Avant la ligne qui construit `emailSubject`, ajouter :
```typescript
const isCM2 = requestData.childClass?.trim().toUpperCase() === 'CM2';
```

Puis remplacer la construction de `emailSubject` par :
```typescript
const emailSubject = isCM2
  ? `Nouvelle réservation - Club Ado${requestData.childName ? " - " + requestData.childName : ""}`
  : `Nouvelle réservation - ${
      requestData.reservationType === "wednesday" ? "Mercredi" : 
      requestData.reservationType === "teen-holiday" ? "Club Ado" : "Vacances"
    }${requestData.childName ? " - " + requestData.childName : ""}`;
```

Aucune autre modification dans le fichier. Redéploiement de la edge function après le changement.
