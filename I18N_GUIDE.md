# 🌍 Sistema di Localizzazione (i18n)

Sistema multilingua completo basato su `react-i18next` e `expo-localization` con supporto per 4 lingue.

## 📁 Struttura del Progetto

```
i18n/
├── index.ts                    # Configurazione principale i18n

locales/
├── it.json                     # Traduzioni italiano
├── en.json                     # Traduzioni inglese
├── fr.json                     # Traduzioni francese
└── es.json                     # Traduzioni spagnolo

contexts/
└── I18nContext.tsx             # Provider React per gestione stato lingua

utils/
└── i18nUtils.ts               # Funzioni utility per la localizzazione
```

## 🚀 Lingue Supportate

- 🇮🇹 **Italiano** (it) - lingua predefinita
- 🇬🇧 **Inglese** (en)
- 🇫🇷 **Francese** (fr)
- 🇪🇸 **Spagnolo** (es)

## ⚙️ Come Funziona

### 1. Rilevamento Automatico della Lingua

All'avvio dell'app, il sistema:
1. Controlla se c'è una lingua salvata in `AsyncStorage`
2. Se non c'è, rileva la lingua del dispositivo usando `expo-localization`
3. Se la lingua del dispositivo non è supportata, usa l'italiano come default

### 2. Salvataggio Preferenze

La lingua scelta dall'utente viene salvata in `AsyncStorage` con chiave `app.language` e persiste tra le sessioni.

## 📖 Uso nei Componenti

### Esempio Base

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.search')}</Text>
      <Text>{t('titles.home')}</Text>
    </View>
  );
}
```

### Con Interpolazione

```tsx
const count = 5;
<Text>{t('home.expiringCount', { count })}</Text>
// Risultato: "5 prodotti in scadenza tra 2 giorni" (in italiano)
```

### Cambiare Lingua

```tsx
import { useI18n } from '@/contexts/I18nContext';

export default function LanguageSelector() {
  const { language, setLanguage, supported } = useI18n();
  
  const handleChange = async (newLang: SupportedLang) => {
    await setLanguage(newLang);
    // La lingua viene salvata automaticamente in AsyncStorage
  };
  
  return (
    <View>
      <Text>Lingua attuale: {language}</Text>
      {supported.map(lang => (
        <Button key={lang} onPress={() => handleChange(lang)}>
          {lang}
        </Button>
      ))}
    </View>
  );
}
```

## 🛠️ Funzioni Utility

```tsx
import { 
  getCurrentLanguage, 
  getActiveLanguage,
  getLanguageName,
  getLanguageFlag 
} from '@/utils/i18nUtils';

// Ottieni la lingua attiva
const lang = getCurrentLanguage(); // 'it' | 'en' | 'fr' | 'es'

// Ottieni il nome della lingua
const name = getLanguageName('it'); // 'Italiano'

// Ottieni la bandiera
const flag = getLanguageFlag('en'); // '🇬🇧'
```

## 📝 Aggiungere Nuove Traduzioni

### 1. Aggiungi la chiave in tutti i file JSON

**locales/it.json:**
```json
{
  "mySection": {
    "newKey": "Testo in italiano"
  }
}
```

**locales/en.json:**
```json
{
  "mySection": {
    "newKey": "Text in English"
  }
}
```

E così via per francese e spagnolo.

### 2. Usa la traduzione nel componente

```tsx
const { t } = useTranslation();
<Text>{t('mySection.newKey')}</Text>
```

## 🌐 Aggiungere una Nuova Lingua

### Passo 1: Crea il file JSON

Crea `locales/de.json` (esempio per tedesco):

```json
{
  "tabs": {"pantry":"Speisekammer","export":"Liste exportieren","settings":"Einstellungen"},
  "titles": {"home":"Meine Speisekammer", ...},
  ...
}
```

### Passo 2: Aggiorna i18n/index.ts

```typescript
import de from '@/locales/de.json';

export const supportedLngs = ['it','en','fr','es','de'] as const;

export function ensureI18nInitialized(initialLang?: SupportedLang) {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          it: { translation: it },
          en: { translation: en },
          fr: { translation: fr },
          es: { translation: es },
          de: { translation: de }, // Aggiungi qui
        },
        ...
      })
  }
}

function detectDeviceLang(): SupportedLang {
  ...
  if (code.startsWith('de')) return 'de'; // Aggiungi qui
  ...
}
```

### Passo 3: Aggiorna utils/i18nUtils.ts

```typescript
export function getLanguageName(lang: SupportedLang): string {
  const names: Record<SupportedLang, string> = {
    it: 'Italiano',
    en: 'English',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch', // Aggiungi qui
  };
  return names[lang] || names.it;
}
```

## 🔍 Struttura delle Traduzioni

I file JSON sono organizzati in sezioni:

```json
{
  "tabs": {...},           // Etichette dei tab
  "titles": {...},         // Titoli delle schermate
  "common": {...},         // Testi comuni riutilizzabili
  "home": {...},          // Testi specifici della home
  "recipes": {...},       // Testi delle ricette
  "exports": {...},       // Testi esportazione
  "settings": {...},      // Testi impostazioni
  "modals": {...},        // Testi modal
  "quality": {...}        // Testi qualità prodotti
}
```

## ✅ Best Practices

1. **Usa sempre chiavi descrittive**: `common.search` invece di `s1`
2. **Mantieni la stessa struttura** in tutti i file JSON
3. **Testa le traduzioni** in tutte le lingue supportate
4. **Non hardcodare stringhe**: usa sempre `t('key')`
5. **Organizza per contesto**: raggruppa traduzioni correlate
6. **Gestisci plurali con i18next**: `{{count}} items`

## 🐛 Debug

Per vedere quale lingua è attiva:

```tsx
import { getCurrentLanguage } from '@/i18n';

console.log('Current language:', getCurrentLanguage());
```

Per verificare se i18n è inizializzato:

```tsx
import i18n from '@/i18n';

console.log('i18n initialized:', i18n.isInitialized);
console.log('Current language:', i18n.language);
```

## 🎯 Esempio Completo

Vedi `app/(tabs)/settings/index.tsx` per un esempio completo di:
- Visualizzazione lingua attiva
- Modal per cambio lingua
- Salvataggio preferenze
- Uso di traduzioni dinamiche

## 📱 Compatibilità

- ✅ iOS
- ✅ Android  
- ✅ Web (tramite React Native Web)

Il sistema funziona perfettamente su tutte le piattaforme supportate da Expo.
