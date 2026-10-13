# Сборки для Windows и Android

Здесь лежат конфиги обёрток. Сайт на GitHub Pages они не затрагивают: результаты сборки в git не попадают (см. `.gitignore`).

- `copy-web.js` копирует статические файлы игры (index.html, css, js, fonts, flags, i18n) в каталог обёртки.
- `icons/` содержит иконку приложения (png/ico).

## Windows (Electron, portable .exe)
```
cd packaging/electron && npm ci
WINEPREFIX=~/.wine-subtrack npm run dist:win   # на Linux нужен wine
```
Результат: `dist/NationalFootballManager-<ver>-portable.exe`. Сохранения (IndexedDB) хранятся в `%APPDATA%\NationalFootballManager`.

## Android (Capacitor 7)
```
cd packaging/android && npm ci
export ANDROID_HOME=/path/to/android-sdk     # platforms;android-35, build-tools;35.0.0, JDK 21
export NFM_KEYSTORE=/path/nfm-release.jks NFM_KEYSTORE_PASSWORD=...   # без них APK получится неподписанным
npm run build:apk
```
Результат: `android/app/build/outputs/apk/release/app-release.apk`. Ориентация портретная, полноэкранный иммерсивный режим (системные панели появляются свайпом), отрисовка под вырезом (shortEdges). Кнопка «Назад» закрывает окно → возвращает на предыдущий экран → в главное меню → показывает вопрос «Выйти из игры?» (игра сохраняется перед выходом). JS-мост `window.NFMNative`: `exit()`, `keepOn(bool)`.
