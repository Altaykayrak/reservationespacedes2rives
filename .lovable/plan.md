
## Objectif

Permettre d'exclure des dates spécifiques (jours fériés, fermetures exceptionnelles) d'une période de vacances. Les dates exclues ne seront pas réservables et ne compteront pas dans le calcul du minimum de 3 jours.

## Approche

Utiliser la table existante `closed_periods` comme source globale de dates exclues. Cette table contient déjà `start_date`, `end_date` et `reason`. Toute date tombant dans une `closed_period` sera automatiquement exclue de toutes les périodes de vacances qui la chevauchent.

## Modifications

### 1. Interface admin : gestion des jours exclus

Sur la page `/admin/holidays`, ajouter un bouton par période de vacances permettant de gérer les jours exclus. Ce bouton ouvrira un dialogue listant les jours ouvrés de la période avec la possibilité de marquer/démarquer des dates comme exclues. Les exclusions seront sauvegardées dans `closed_periods`.

**Fichiers concernés :**
- Nouveau composant `src/components/admin/holidays/ExcludedDatesManager.tsx` : dialogue avec les dates cochables
- `src/components/admin/holidays/HolidayPeriodItem.tsx` : ajout du bouton "Jours exclus"

**Migration DB :** Ajouter des politiques RLS INSERT/UPDATE/DELETE sur `closed_periods` pour les admins (actuellement la table est en lecture seule).

### 2. Front-end réservation : filtrer les dates exclues

Lors de la génération des dates réservables, exclure celles qui tombent dans une `closed_period`.

**Fichiers concernés :**
- `src/components/reservations/holiday/WorkdayDateSelector.tsx` : requête `closed_periods` et filtrage des dates
- `src/components/reservations/holiday/TeenClassDateSelector.tsx` : idem si ce composant génère aussi des dates

### 3. Validation minimum 3 jours : adaptation

Adapter la logique pour que le minimum de 3 jours par semaine tienne compte du nombre de jours ouvrés disponibles (hors jours exclus). Si une semaine n'a que 3 jours disponibles (ex: 5 jours - 1 WE - 1 férié = 3), alors 3 jours sélectionnés = valide. Si une semaine n'a que 2 jours disponibles, le minimum sera 2.

**Fichiers concernés :**
- `src/utils/dateUtils.ts` : `validateMinimumDaysPerWeek` acceptera un paramètre optionnel de dates exclues
- `src/utils/reservationValidationUtils.ts` : passage des dates exclues
- `src/components/reservations/HolidayReservationContent.tsx` : récupération des `closed_periods` et transmission

### 4. Back-end : protection serveur

Ajouter une vérification dans la fonction SQL `check_holiday_spots_available` ou dans le code de création de réservation (`reservationCreationUtils.ts`) pour rejeter toute réservation sur une date exclue.

**Fichiers concernés :**
- `src/utils/reservationCreationUtils.ts` : vérifier que chaque date n'est pas dans `closed_periods` avant insertion

## Détails techniques

- Migration SQL : ajout de politiques RLS admin sur `closed_periods` (INSERT, UPDATE, DELETE pour les admins)
- La table `closed_periods` est globale (pas liée à une période spécifique), ce qui permet d'exclure un jour férié national qui affecte toutes les périodes
- Le dialogue admin affichera uniquement les jours ouvrés de la période sélectionnée, avec ceux déjà dans `closed_periods` pré-cochés
