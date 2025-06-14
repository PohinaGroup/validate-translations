import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { CONFIG } from './translation-config';

function getAllKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((keys, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return [...keys, ...getAllKeys(obj[key], newKey)];
    }
    return [...keys, newKey];
  }, []);
}

function loadTranslations() {
  const translations = {};

  CONFIG.LOCALES.forEach((locale) => {
    const filePath = path.join(CONFIG.LOCALES_DIR, `${locale}.json`);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      translations[locale] = content;
    } catch (error) {
      console.error(`❌ Error loading ${locale}.json:`, error);
      process.exit(1);
    }
  });

  return translations;
}

function extractKeysFromSource() {
  const usedKeys = new Set();
  const processedFiles = new Set();

  CONFIG.SOURCE_DIRS.forEach((pattern) => {
    const files = glob.sync(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**'],
      absolute: true,
    });
    console.log(`Found ${files.length} files to process`);

    files.forEach((file) => {
      if (processedFiles.has(file)) return;
      processedFiles.add(file);

      try {
        const content = fs.readFileSync(file, 'utf-8');

        CONFIG.TRANSLATION_PATTERNS.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            usedKeys.add(match[1]);
          }
        });
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    });
  });

  return usedKeys;
}

function findMissingKeys() {
  const translations = loadTranslations();
  const allKeys = new Set();
  const missingKeys = [];

  Object.values(translations).forEach((locale) => {
    const keys = getAllKeys(locale);
    keys.forEach((key) => allKeys.add(key));
  });

  allKeys.forEach((key) => {
    const missingIn = [];

    Object.entries(translations).forEach(([locale, translations]) => {
      const keys = getAllKeys(translations);
      if (!keys.includes(key)) {
        missingIn.push(locale);
      }
    });

    if (missingIn.length > 0) {
      missingKeys.push({ key, missingIn });
    }
  });

  return missingKeys;
}

function validateTranslationsComplete() {
  console.log('🔍 Validating translation completeness...\n');

  const translations = loadTranslations();
  const usedKeys = extractKeysFromSource();
  const allLocaleKeys = new Set();

  Object.values(translations).forEach((locale) => {
    getAllKeys(locale).forEach((key) => allLocaleKeys.add(key));
  });

  const missingInLocales = findMissingKeys();
  const missingInCode = Array.from(usedKeys).filter(
    (key) => !allLocaleKeys.has(key),
  );
  const unusedKeys = Array.from(allLocaleKeys)
    .filter((key) => !usedKeys.has(key))
    .filter((key) => !CONFIG.IGNORED_UNUSED_KEYS.includes(key));

  return {
    missingInLocales,
    missingInCode,
    unusedKeys,
    totalKeysFound: allLocaleKeys.size,
  };
}

function reportResults(results) {
  const { missingInLocales, missingInCode, unusedKeys, totalKeysFound } =
    results;

  console.log(`📊 Translation Statistics:`);
  console.log(`Total translation keys: ${totalKeysFound}`);
  console.log(`Missing keys: ${missingInLocales.length}`);
  console.log(`Unused keys: ${unusedKeys.length}\n`);

  if (missingInLocales.length === 0 && missingInCode.length === 0) {
    console.log('✅ All translations are complete and consistent!');

    if (unusedKeys.length > 0) {
      console.log(`\n⚠️  Found ${unusedKeys.length} unused keys:`);
      unusedKeys.forEach((key) => console.log(`😩  - ${key}`));
    }
    return;
  }

  if (missingInLocales.length > 0) {
    console.log('❌ Missing keys between locales:\n');

    const missingByLocale = {};
    missingInLocales.forEach(({ key, missingIn }) => {
      missingIn.forEach((locale) => {
        if (!missingByLocale[locale]) {
          missingByLocale[locale] = [];
        }
        missingByLocale[locale].push(key);
      });
    });

    Object.entries(missingByLocale).forEach(([locale, keys]) => {
      console.log(`📝 Missing in ${locale.toUpperCase()}:`);
      keys.forEach((key) => console.log(`  - ${key}`));
      console.log();
    });
  }

  if (missingInCode.length > 0) {
    console.log('❌ Keys used in code but missing from ALL locales:\n');
    missingInCode.forEach((key) => console.log(`  - ${key}`));
    console.log();
  }

  process.exit(1);
}

const results = validateTranslationsComplete();
reportResults(results);
