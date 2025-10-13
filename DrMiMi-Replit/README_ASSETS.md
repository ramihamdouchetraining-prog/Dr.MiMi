# Guide des Assets Dr.MiMi

## 👩‍⚕️ Avatars Dr. Mimi

### Description
Dr. Mimi est la mascotte de la plateforme, une docteure musulmane portant un hijab rose et blanc, avec des yeux marron miel et une blouse médicale blanche. Elle incarne la bienveillance, la compétence et l'accessibilité de l'éducation médicale.

### 10 Poses Disponibles (Collection Complète)

Les avatars sont stockés dans `attached_assets/avatars/dr_mimi/` :

#### 1. **Reading** (`reading.png`)
- **Description** : Dr. Mimi lisant un livre médical
- **Usage** : Pages d'étude, bibliothèque, cours
- **Emotion** : Concentration, apprentissage

#### 2. **Stethoscope** (`stethoscope.png`)
- **Description** : Dr. Mimi avec un stéthoscope autour du cou
- **Usage** : Pages cliniques, examens pratiques
- **Emotion** : Professionnalisme, confiance

#### 3. **Medicine** (`medicine.png`)
- **Description** : Dr. Mimi tenant une boîte de médicaments
- **Usage** : Pharmacologie, prescriptions
- **Emotion** : Soin, attention

#### 4. **Idea** (`idea.png`)
- **Description** : Dr. Mimi avec une ampoule lumineuse (eureka!)
- **Usage** : Quiz réussis, découvertes, astuces
- **Emotion** : Innovation, intelligence

#### 5. **Pointing** (`pointing.png`)
- **Description** : Dr. Mimi pointant vers un tableau
- **Usage** : Explications, tutoriels, présentations
- **Emotion** : Enseignement, clarté

#### 6. **Greeting** (`greeting.png`)
- **Description** : Dr. Mimi faisant un salut amical
- **Usage** : Page d'accueil, bienvenue, profil
- **Emotion** : Accueil, sympathie

#### 7. **Writing** (`writing.png`)
- **Description** : Dr. Mimi écrivant sur une tablette
- **Usage** : Création de contenu, notes, admin
- **Emotion** : Productivité, modernité

#### 8. **Thinking** (`thinking.png`)
- **Description** : Dr. Mimi en réflexion profonde
- **Usage** : Questions difficiles, résolution de problèmes, réflexion
- **Emotion** : Concentration, analyse

#### 9. **Smiling** (`smiling.png`)
- **Description** : Dr. Mimi avec un sourire bienveillant
- **Usage** : Succès, félicitations, encouragements
- **Emotion** : Joie, bienveillance, satisfaction

#### 10. **Laptop** (`laptop.png`)
- **Description** : Dr. Mimi en consultation télémédecine
- **Usage** : Consultations en ligne, support technique, travail à distance
- **Emotion** : Modernité, accessibilité

## 💻 Utilisation dans le Code

### Import du Composant

```typescript
import AvatarDrMimi from '@/components/AvatarDrMimi';
// ou
import { AvatarDrMimi } from '../components/AvatarDrMimi';
```

### Exemples d'Utilisation

#### Basique
```tsx
<AvatarDrMimi pose="greeting" />
```

#### Avec taille personnalisée
```tsx
<AvatarDrMimi 
  pose="reading" 
  size="large"  // 'small' | 'medium' | 'large'
/>
```

#### Avec animation
```tsx
<AvatarDrMimi 
  pose="idea" 
  animated={true}  // Active les animations CSS
/>
```

#### Exemple complet
```tsx
<AvatarDrMimi
  pose="stethoscope"
  size="medium"
  animated={true}
  alt="Dr. Mimi avec stéthoscope"
  className="shadow-lg rounded-full"
/>
```

### Props du Composant

| Prop | Type | Par défaut | Description |
|------|------|------------|-------------|
| `pose` | `'reading' \| 'stethoscope' \| 'medicine' \| 'idea' \| 'pointing' \| 'greeting' \| 'writing' \| 'thinking' \| 'smiling' \| 'laptop'` | Obligatoire | La pose de Dr. Mimi |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Taille de l'avatar (64px, 128px, 256px) |
| `animated` | `boolean` | `false` | Active les animations CSS |
| `alt` | `string` | Auto-généré | Texte alternatif pour l'accessibilité |
| `className` | `string` | `''` | Classes CSS additionnelles |
| `preload` | `boolean` | `false` | Précharge l'image |

### Animations Disponibles

Les animations varient selon la pose :
- **pulse** : Pour reading, medicine, writing, thinking, laptop
- **bounce** : Pour greeting, pointing, smiling
- **rotate** : Pour stethoscope
- **glow** : Pour idea

### Performance

#### Lazy Loading
Les avatars utilisent l'IntersectionObserver pour un chargement différé :
```tsx
// L'image ne se charge que quand elle entre dans le viewport
<AvatarDrMimi pose="greeting" />
```

#### Préchargement
Pour les avatars critiques, activez le préchargement :
```tsx
<AvatarDrMimi pose="greeting" preload={true} />
```

#### Hook de préchargement
```tsx
import { useAvatarPreload } from '@/components/AvatarDrMimi';

function MyComponent() {
  // Précharge les poses spécifiées au montage
  useAvatarPreload(['greeting', 'reading', 'idea']);
  
  return <div>...</div>;
}
```

## 🎨 Autres Assets Importants

### Logo Principal
- **Fichier** : `/attached_assets/generated_images/Dr.Mimi_hijab_logo_03d09579.png`
- **Usage** : Header, favicon, splash screen
- **Format** : PNG avec transparence

### Images Médicales 3D
- **Système digestif** : `3D_digestive_system_anatomy_e67eebe9.png`
- **Système respiratoire** : `3D_respiratory_system_anatomy_86402c72.png`
- **Système squelettique** : `3D_skeletal_system_anatomy_04815825.png`

### Diagrammes Anatomiques (Français)
- **Cerveau** : `French_brain_anatomy_diagram_2cfe0c4d.png`
- **Cœur** : `French_heart_anatomy_diagram_308d6c87.png`
- **Squelette** : `French_skeleton_anatomy_chart_ff613389.png`

### Backgrounds
- **Hero médical** : `Medical_hero_background_dbc5b669.png`
- **Education médicale** : `Medical_education_hero_background_9712ea2f.png`

## 📁 Structure des Dossiers

```
attached_assets/
├── avatars/
│   └── dr_mimi/
│       ├── reading.png
│       ├── stethoscope.png
│       ├── medicine.png
│       ├── idea.png
│       ├── pointing.png
│       ├── greeting.png
│       ├── writing.png
│       ├── thinking.png
│       ├── smiling.png
│       └── laptop.png
└── generated_images/
    ├── Dr.Mimi_hijab_logo_03d09579.png
    ├── 3D_digestive_system_anatomy_e67eebe9.png
    ├── 3D_respiratory_system_anatomy_86402c72.png
    └── ...
```

## 🔧 Galerie de Test

Pour tester tous les avatars :
```tsx
import { AvatarDrMimiGallery } from '@/components/AvatarDrMimi';

function TestPage() {
  return (
    <AvatarDrMimiGallery 
      size="small" 
      animated={true} 
    />
  );
}
```

## 📝 Guidelines de Design

### Cohérence visuelle
- **Hijab** : Toujours rose et blanc
- **Yeux** : Marron miel
- **Blouse** : Blanche médicale
- **Style** : 3D cartoon, amical et professionnel

### Accessibilité
- Toujours fournir un `alt` text descriptif
- Contraste suffisant avec l'arrière-plan
- Tailles adaptatives pour mobile

### Contexte culturel
- Respecter la représentation musulmane
- Maintenir la modestie vestimentaire
- Incarner les valeurs de diversité et d'inclusion

---

*Pour ajouter de nouveaux avatars ou assets, contactez l'équipe de design.*
*Dernière mise à jour : Septembre 2025*