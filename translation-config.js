import path from 'path';

export const CONFIG = {
  LOCALES: ['en', 'fi'],

  LOCALES_DIR: path.join(__dirname, '../i18n/messages'),
  SOURCE_DIRS: [path.join(__dirname, '../app/**/*.{ts,tsx,js,jsx}')],

  TRANSLATION_PATTERNS: [
    // Basic t() function calls - must be preceded by space, start of line, or opening brace
    /(?:^|[\s{(])\bt\(['"`]([^'"`]+)['"`]\)/g,

    // t() with parameters - must be preceded by space, start of line, or opening brace
    /(?:^|[\s{(])\bt\(['"`]([^'"`]+)['"`],\s*{[^}]+}\)/g,

    // useTranslation hook usage followed by t()
    /useTranslation\(\).*?\bt\(['"`]([^'"`]+)['"`]\)/g,

    // JSX attribute usage
    /(?:text|label|title|placeholder|aria-label)=\{t\(['"`]([^'"`]+)['"`]\)\}/g,

    // JSX children with translation
    /(?:^|[>\s{])\bt\(['"`]([^'"`]+)['"`]\)(?=\s*[}<]|$)/g,
  ],

  IGNORED_UNUSED_KEYS: [],
};
