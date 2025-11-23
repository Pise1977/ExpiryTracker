import 'react-i18next';
import it from '@/locales/it.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof it;
    };
  }
}
