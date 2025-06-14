# validate-translations

A straightforward JavaScript script to ensure your application's translations aren't a complete mess. It checks for missing, inconsistent, and unused translation keys across your locales and source code. Because nobody likes broken translations.

## Features

This script isn't fancy, but it gets the job done. It will tell you if you've messed up your translations by:

*   **Finding Missing Keys Across Locales**: Identifies translation keys that exist in one locale but are missing in others. Consistency, people!
*   **Detecting Keys Missing from All Locales**: Catches keys that you're using in your code but haven't bothered to define in *any* of your translation files. Seriously?
*   **Highlighting Unused Keys**: Points out translation keys defined in your locale files that aren't actually used anywhere in your source code. Clean up your garbage.

## How It Works

It's not magic, just basic file parsing and comparison:

1.  **Loads Translations**: It slurps up all your `.json` translation files from the configured directory.
2.  **Scans Source Code**: It then goes through your specified source directories, looking for translation key usage based on a set of regular expressions.
3.  **Compares & Reports**: Finally, it compares the keys found in your translation files against those found in your code and spits out a report. If things are bad, it'll exit with an error code.

## Configuration

All the important bits are in `translation-config.js`. You'll need to adjust this to fit your project, obviously. Don't be lazy.

```javascript
// translation-config.js
import path from 'path';

export const CONFIG = {
  // Your supported locales. 'en' and 'fi' are just examples.
  LOCALES: ['en', 'fi'],

  // The directory where your locale JSON files live.
  LOCALES_DIR: path.join(__dirname, '../i18n/messages'),

  // An array of glob patterns for your source code directories.
  // This is where the script will look for translation key usage.
  SOURCE_DIRS: [path.join(__dirname, '../app/**/*.{ts,tsx,js,jsx}')],

  // Regular expressions to find translation keys in your source code.
  // These patterns capture the key string from your translation function calls.
  // Adjust these if your translation function or syntax is different.
  TRANSLATION_PATTERNS: [
    // Basic t() function calls: t('my.key')
    /(?:^|[\s{(])\bt\(['"`]([^'"`]+)['"`]\)/g,
    // t() with parameters: t('my.key', { count: 1 })
    /(?:^|[\s{(])\bt\(['"`]([^'"`]+)['"`],\s*{[^}]+}\)/g,
    // useTranslation hook followed by t(): useTranslation().t('another.key')
    /useTranslation\(\).*?\bt\(['"`]([^'"`]+)['"`]\)/g,
    // JSX attribute usage: <Component text={t('component.text')} />
    /(?:text|label|title|placeholder|aria-label)=\{t\(['"`]([^'"`]+)['"`]\)\}/g,
    // JSX children with translation: <div>{t('some.text')}</div>
    /(?:^|[>\s{])\bt\(['"`]([^'"`]+)['"`]\)(?=\s*[}<]|$)/g,
  ],

  // An array of translation keys that should be ignored when reporting unused keys.
  // Use this for keys that are dynamically generated or used in ways the regex can't catch.
  IGNORED_UNUSED_KEYS: [],
};
CONFIG Breakdown:
LOCALES: An array of strings, each representing a locale your application supports (e.g., ['en', 'fr', 'de']).
LOCALES_DIR: The absolute path to the directory containing your locale JSON files (e.g., en.json, fi.json).
SOURCE_DIRS: An array of glob patterns. These tell the script where to look for your application's source code files (.js, .jsx, .ts, .tsx, etc.) that might contain translation calls.
TRANSLATION_PATTERNS: This is crucial. It's an array of regular expressions. Each regex should be designed to capture the translation key string from your code. The script expects the key to be in the first capturing group (match[1]). Adjust these if your translation library or syntax differs.
IGNORED_UNUSED_KEYS: Sometimes you have keys that are used dynamically or in ways the regex can't detect. Add those keys here to prevent them from being reported as "unused."
Usage
It's a simple Node.js script. Just run it:



```bash
node validate-translations.js
```
If everything is hunky-dory, it'll exit cleanly. If there are issues (missing keys, etc.), it will print a detailed report and exit with a non-zero status code (process.exit(1)). This makes it perfect for CI/CD pipelines.

Output Examples
All Good
🔍 Validating translation completeness...

📊 Translation Statistics:
Total translation keys: 150
Missing keys: 0
Unused keys: 0

✅ All translations are complete and consistent!
With Unused Keys
🔍 Validating translation completeness...

📊 Translation Statistics:
Total translation keys: 150
Missing keys: 0
Unused keys: 3

✅ All translations are complete and consistent!

⚠️  Found 3 unused keys:
😩  - common.old_feature_message
😩  - dashboard.legacy_widget_title
😩  - settings.unused_option

With Missing Keys
🔍 Validating translation completeness...

📊 Translation Statistics:
Total translation keys: 147
Missing keys: 5
Unused keys: 0

❌ Missing keys between locales:

📝 Missing in FI:
  - common.welcome_message
  - dashboard.summary_title

📝 Missing in EN:
  - common.goodbye_message

❌ Keys used in code but missing from ALL locales:

  - auth.login_button_text
  - profile.edit_profile_link

Installation
Just clone this repository. It's a standalone script, not a package.



```bash
git clone https://github.com/PohinaGroup/validate-translations.git
cd validate-translations
```
Make sure you have Node.js installed. The glob package is a dependency, so you might need to run npm install or yarn if you're getting module not found errors.

Contributing
If you find a bug or have an improvement, feel free to open an issue or a pull request. Just make sure your changes actually make sense.

