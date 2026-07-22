import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import te from './locales/te.json';
import ta from './locales/ta.json';
import gu from './locales/gu.json';
import ur from './locales/ur.json';
import kn from './locales/kn.json';
import or from './locales/or.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';
import as from './locales/as.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  mr: { translation: mr },
  te: { translation: te },
  ta: { translation: ta },
  gu: { translation: gu },
  ur: { translation: ur },
  kn: { translation: kn },
  or: { translation: or },
  ml: { translation: ml },
  pa: { translation: pa },
  as: { translation: as },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
