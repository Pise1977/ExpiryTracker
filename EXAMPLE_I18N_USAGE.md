# 📚 Esempi Pratici di Utilizzo i18n

Questo documento mostra esempi concreti di come usare il sistema di localizzazione nell'app.

## ✅ Conversione della Schermata Cover (Esempio Reale)

### Prima (stringhe hardcoded):
```tsx
export default function CoverScreen() {
  const router = useRouter();
  
  return (
    <View>
      <Text>Scansiona al volo i tuoi prodotti con il barcode!</Text>
      <Text>Ti avvisiamo quando qualcosa sta per scadere 🕒</Text>
      <Text>Idee gustose con quello che hai in frigo 🍝</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/(home)')}>
        <Text>Vai!</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Dopo (con traduzioni):
```tsx
import { useTranslation } from 'react-i18next';

export default function CoverScreen() {
  const router = useRouter();
  const { t } = useTranslation();  // ✨ Hook per le traduzioni
  
  return (
    <View>
      <Text>{t('cover.feature1')}</Text>
      <Text>{t('cover.feature2')}</Text>
      <Text>{t('cover.feature3')}</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)/(home)')}>
        <Text>{t('cover.enterButton')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### File JSON aggiunti:
```json
// locales/it.json
{
  "cover": {
    "feature1": "Scansiona al volo i tuoi prodotti con il barcode!",
    "feature2": "Ti avvisiamo quando qualcosa sta per scadere 🕒",
    "feature3": "Idee gustose con quello che hai in frigo 🍝",
    "enterButton": "Vai!"
  }
}

// locales/en.json
{
  "cover": {
    "feature1": "Scan your products with barcode in a snap!",
    "feature2": "We notify you when something is about to expire 🕒",
    "feature3": "Tasty ideas with what you have in the fridge 🍝",
    "enterButton": "Go!"
  }
}
```

## 🎯 Esempi per Diversi Casi d'Uso

### 1. Testo Semplice
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.search')}</Text>
      <Text>{t('titles.home')}</Text>
    </View>
  );
}
```

### 2. Testo con Interpolazione (Variabili)
```tsx
function ProductList({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return (
    <Text>{t('home.expiringCount', { count })}</Text>
    // Risultato: "5 prodotti in scadenza tra 2 giorni"
  );
}
```

### 3. Pulsanti e AccessibilityLabel
```tsx
function SaveButton() {
  const { t } = useTranslation();
  
  return (
    <TouchableOpacity
      accessibilityLabel={t('common.save')}
    >
      <Text>{t('common.save')}</Text>
    </TouchableOpacity>
  );
}
```

### 4. Placeholder nei TextInput
```tsx
function SearchBar() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  
  return (
    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder={t('common.searchPlaceholder')}
    />
  );
}
```

### 5. Alert e Messaggi
```tsx
function DeleteProduct() {
  const { t } = useTranslation();
  
  const handleDelete = () => {
    Alert.alert(
      t('alerts.deleteTitle'),
      t('alerts.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), onPress: () => deleteProduct() }
      ]
    );
  };
  
  return <Button onPress={handleDelete}>{t('common.delete')}</Button>;
}
```

### 6. Selettore di Lingua
```tsx
import { useI18n } from '@/contexts/I18nContext';

function LanguageSelector() {
  const { language, setLanguage, supported } = useI18n();
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('settings.language')}: {language}</Text>
      {supported.map(lang => (
        <TouchableOpacity 
          key={lang}
          onPress={() => setLanguage(lang)}
        >
          <Text>{lang.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
```

### 7. Liste e Mappature
```tsx
function CategoryList() {
  const { t } = useTranslation();
  
  const categories = ['dairy', 'meat', 'vegetables'];
  
  return (
    <FlatList
      data={categories}
      renderItem={({ item }) => (
        <Text>{t(`categories.${item}`)}</Text>
      )}
    />
  );
}
```

### 8. Condizioni e Testo Dinamico
```tsx
function ProductStatus({ isExpired }: { isExpired: boolean }) {
  const { t } = useTranslation();
  
  return (
    <Text style={{ color: isExpired ? 'red' : 'green' }}>
      {isExpired ? t('product.expired') : t('product.fresh')}
    </Text>
  );
}
```

### 9. Con useCallback e useMemo
```tsx
function OptimizedComponent() {
  const { t } = useTranslation();
  
  const getMessage = useCallback(() => {
    return t('messages.welcome');
  }, [t]);
  
  const formattedTitle = useMemo(() => {
    return t('titles.home').toUpperCase();
  }, [t]);
  
  return (
    <View>
      <Text>{formattedTitle}</Text>
      <Text>{getMessage()}</Text>
    </View>
  );
}
```

### 10. Fuori dai Componenti React
```tsx
import { getCurrentLanguage } from '@/i18n';
import i18n from '@/i18n';

// In una funzione utility
export function formatDate(date: Date) {
  const lang = getCurrentLanguage();
  return date.toLocaleDateString(lang);
}

// In un service
export async function fetchData() {
  const response = await fetch('/api/data', {
    headers: {
      'Accept-Language': getCurrentLanguage()
    }
  });
  return response.json();
}

// Traduzione diretta (senza hook)
export function getTranslation(key: string) {
  return i18n.t(key);
}
```

## 🔧 Funzioni Utility Disponibili

```tsx
import { 
  getCurrentLanguage,
  getActiveLanguage,
  getLanguageName,
  getLanguageFlag,
  isLanguageSupported 
} from '@/utils/i18nUtils';

// Ottieni lingua corrente
const currentLang = getCurrentLanguage(); // 'it' | 'en' | 'fr' | 'es'

// Ottieni nome leggibile
const langName = getLanguageName('it'); // 'Italiano'

// Ottieni bandiera
const flag = getLanguageFlag('en'); // '🇬🇧'

// Verifica supporto
if (isLanguageSupported('de')) {
  console.log('Tedesco supportato');
}
```

## 📊 Pattern Avanzati

### Namespace Organizzati
```json
{
  "home": {
    "welcome": "Benvenuto",
    "subtitle": "La tua dispensa digitale"
  },
  "product": {
    "add": "Aggiungi prodotto",
    "edit": "Modifica prodotto",
    "delete": "Elimina prodotto"
  }
}
```

### Plurali e Conteggi
```json
{
  "items": "{{count}} elemento",
  "items_plural": "{{count}} elementi"
}
```

```tsx
// i18next gestisce automaticamente i plurali
<Text>{t('items', { count: 1 })}</Text>  // "1 elemento"
<Text>{t('items', { count: 5 })}</Text>  // "5 elementi"
```

### Fallback per Traduzioni Mancanti
```tsx
// Se la chiave non esiste, mostra il testo di default
<Text>{t('nonexistent.key', { defaultValue: 'Testo di default' })}</Text>
```

## ⚠️ Errori Comuni da Evitare

### ❌ NON fare così:
```tsx
// 1. Concatenazione di stringhe tradotte
const message = t('hello') + ' ' + t('world');  // ❌

// 2. Condizioni dentro le traduzioni
const text = isLoggedIn ? t('welcome.user') : t('welcome.guest');  // ❌ (meglio usare interpolazione)

// 3. Usare traduzioni prima dell'inizializzazione
const title = t('title');  // ❌ se usato fuori da componente
```

### ✅ Fare così invece:
```tsx
// 1. Usa interpolazione
<Text>{t('greeting', { name: userName })}</Text>

// 2. Crea chiavi separate per stati diversi
{isLoggedIn ? t('welcome.loggedIn') : t('welcome.guest')}

// 3. Usa hook nei componenti
function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t('title')}</Text>;
}
```

## 🎨 Integrazione con Altri Hook

```tsx
function CompleteExample() {
  const { t } = useTranslation();
  const { language } = useI18n();
  const router = useRouter();
  const { products } = useProducts();
  
  const expiringCount = products.filter(p => p.isExpiring).length;
  
  return (
    <View>
      <Text>{t('home.welcome')}</Text>
      <Text>{t('home.currentLanguage')}: {language}</Text>
      <Text>{t('home.expiringCount', { count: expiringCount })}</Text>
      <Button onPress={() => router.push('/settings')}>
        {t('common.settings')}
      </Button>
    </View>
  );
}
```

## 📖 Riferimenti

- File di configurazione: `i18n/index.ts`
- Context provider: `contexts/I18nContext.tsx`
- Utility functions: `utils/i18nUtils.ts`
- Traduzioni: `locales/*.json`
- Documentazione completa: `I18N_GUIDE.md`
- Esempio schermata: `app/cover.tsx`
- Esempio settings: `app/(tabs)/settings/index.tsx`
