# Mini Foundry 5e Content Editor

SPA-редактор на React + TypeScript для D&D 5e контента в стиле Foundry VTT:
- Проекты (кампании) с коллекциями: Actors, Items, Spells, Effects, Journal, Tables.
- Глобальный поиск, фильтруемые секции (PCs/Monsters), drag&drop предметов в Actor.
- Шаблонные формы + модалки (skills/resistances/senses).
- Импорт/экспорт JSON Foundry-совместимых документов с round-trip сохранением неизвестных полей (`flags`, любые `system.*`, ownership и пр.).
- IndexedDB autosave + history версий.

## Запуск

```bash
npm install
npm run dev
```

Открыть: `http://localhost:5173`

## Сборка

```bash
npm run build
npm run preview
```

## Деплой

Подходит любой static-hosting (Vercel/Netlify/Nginx): публикуется папка `dist` после `npm run build`.

## Demo data

При первом запуске автоматически создается проект `Demo Campaign` c:
- 2 actors
- 5 items
- 5 spells
- 3 effects
- journal + table

## Документация

- `docs/foundry-import-export.md` — как экспортировать из Foundry и импортировать обратно.
- `docs/ui-json-mapping.md` — таблица маппинга UI -> JSON paths.
