# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## FoodSource — тонкий клиент

Фронтенд B2B-помощника закупщика по ТЗ «FoodSource». Вся логика (фильтры, скоринг, бейджи,
подсветка лучших значений) живёт на стороне API; клиент только отображает ответы.

### Подключение FastAPI-бэкенда

Задайте `VITE_API_URL` (например, `http://localhost:8000`). Без него клиент работает на
встроенной эмуляции API с демо-сидом из 20 поставщиков (`src/lib/api/mock/`).

| Метод | Путь | Примечание |
|---|---|---|
| GET | `/suppliers` | `category, region, city, has_certificates, min_order_max, min_order_unit, q, sort, order, page, page_size` + параметры активного запроса `brief_*` |
| GET | `/suppliers/{id}` | + `brief_*` для пересчёта скора |
| POST | `/compare` | `{ ids: number[2..3], brief? }` → `{ items, best }` |
| POST | `/recommend` | `{ category?, region?, max_min_order?, max_min_order_unit?, need_certificates?, budget_per_unit? }` |
| GET | `/meta` | категории, регионы, города, единицы |

### Скоринг (0–100)

Категория +30, регион +20, сертификаты +20, MOQ ≤ запроса +15, бюджет за единицу +10,
контакты до +10 (телефон/email/сайт пропорционально), данные моложе 180 дней +5.
Скор = набранные баллы / максимум по активным критериям × 100. Без запроса и фильтров
оценивается полнота карточки: сертификаты, указан MOQ, указана цена, контакты, свежесть.

Заметки и статусы хранятся в localStorage браузера; экспорт шортлиста — CSV на клиенте.
