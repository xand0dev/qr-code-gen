# 🚀 QR CODE GEN (Monkey Clone)

Сучасний, швидкий та повністю клієнтський генератор QR-кодів, натхненний функціоналом QRCode Monkey. Побудований на React + TypeScript, працює без бекенду, рендерить високоякісні коди безпосередньо у браузері.

🌍 **[Live Demo (GitHub Pages)](https://xand0dev.github.io/qr-code-gen/)**

---

## ✨ Фічі (Features)

- **Продвинута кастомізація**: Зміна форми точок (body) та кутів (eyes).
- **Кольори та Градієнти**: Повна підтримка кастомних кольорів для фону, точок та рамок.
- **Ін'єкція логотипу**: Можливість завантажити власну картинку/логотип по центру QR-коду.
- **Експорт у високій якості**: Миттєве завантаження готового результату у форматах **PNG** (растр) та **SVG** (вектор).
- **Чуйний UI/UX**: Жорсткий двоколонковий макет із липким (sticky) прев'ю та зручним акордеоном для налаштувань.
- **Zero Backend**: Уся логіка генерації та завантаження файлів відбувається локально на клієнті через Canvas/DOM.

## 🛠 Технологічний стек

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **QR Engine**: [qr-code-styling](https://qr-code-styling.com/) (ванільний JS-рушій, обгорнутий у React `useRef`/`useEffect`).
- **Styling**: Native CSS3 (CSS Variables, Grid, Flexbox, Custom scrollbars & inputs).
- **Deployment**: GitHub Actions -> GitHub Pages.

---

## 🚀 Локальний запуск (Getting Started)

### Передумови

Переконайтеся, що у вас встановлено [Node.js](https://nodejs.org/) (версія 18+).

### Інсталяція

1. Клонуйте репозиторій:

```bash
git clone https://github.com/xand0dev/qr-code-gen.git
cd qr-code-gen
```

2. Встановіть залежності:

```bash
npm install
```

3.  Запустіть dev-сервер:

```bash
npm run dev
```

4. Відкрийте http://localhost:5173 у вашому браузері.

📦 Скрипти
npm run dev — запуск сервера для розробки з Hot Module Replacement (HMR).
npm run build — компіляція TypeScript та збірка оптимізованого бандлу для продакшену.
npm run preview — локальний попередній перегляд зібраного продакшен-білду.
npm run lint — перевірка коду лінтером (ESLint).
