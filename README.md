# Food Safety Awareness Platform

A bilingual (English/Bengali) AI-powered food safety education platform built with React, TypeScript, Vite, and Tailwind CSS.

## Project structure

```
food-safety-platform/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── src/
    ├── main.tsx          # App entry point
    ├── index.css         # Tailwind directives
    ├── App.tsx           # Main app component (routing, all pages, state)
    └── data/
        ├── translations.ts  # EN/BN UI strings
        ├── articles.ts      # Knowledge center articles
        ├── storage.ts       # Food storage shelf-life data
        ├── quiz.ts          # Food safety quiz questions
        ├── checklist.ts     # Home & restaurant hygiene checklists
        └── alerts.ts        # Public safety alerts / recalls
```

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

To build for production:

```bash
npm run build
npm run preview
```

## Notes

- The AI Assistant and Image Analysis pages call the Gemini API (`generativelanguage.googleapis.com`) directly from the browser with an empty `apiKey` string — this was written for a runtime (like Google AI Studio Canvas) that auto-injects a key. To use these features here, add your own Gemini API key in `src/App.tsx` (search for `apiKey`), and consider proxying the request through a backend instead of calling it from the client so the key isn't exposed.
- Sign-in is a demo/mock flow — submitting the auth form always logs in as a hardcoded admin user. Wire it up to real authentication before shipping.
