# mtvl-frontend

`mtvl-frontend` is a modular React UI for the [`mtvl`](https://github.com/mylists/mtvl) tracking backend. It discovers tracking categories (movies, TV shows, books, and any new module) from `GET /api/v1/categories` and renders them through a pluggable `CategoryModule` system.

---

## Key Features

- **Extensible Category Modules**: Each category (e.g., movies, TV shows, books) is an isolated TypeScript module implementing `CategoryModule`.
- **Dynamic Category Discovery**: Active modules come from `GET /api/v1/categories`. Unknown categories fall back to a generic catalog + `/list` client.
- **JWT Auth**: Login, register, profile, password, and account deletion against the backend `auth` API. Tokens are stored locally and sent as `Authorization: Bearer`.
- **Public Catalog + Personal Lists**: Anyone can browse and search catalog items. Signed-in users track their own status, rating, and notes.
- **Search, Stats, and Import/Export**: Global search (`Ctrl/⌘ + K`), dashboard stats, and library backup/restore.

---

## Quick Start

The app talks to a running `mtvl` backend (default `http://localhost:8080`).

### 1. Install & Type-Check

```bash
make install
make lint
# or: npm install && npm run lint
```

### 2. Start the Dev Server

```bash
# Backend at http://localhost:8080 (default)
make dev
# or: npm run dev

# Custom backend origin
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

The Vite server listens on port **5173** and proxies `/api` and `/health` to `VITE_API_BASE_URL`. At runtime you can also set `window.__API_BASE_URL__` in `public/config.js`.

---

## How to Add a New Category Module (e.g., Games)

If the backend already exposes the category via `GET /api/v1/categories` and follows the shared catalog + `/list` convention, the generic fallback module is enough. A custom module is only needed for category-specific fields and UI.

Adding a first-class module requires only **3 steps**:

### Step 1: Implement `CategoryModule`

Create `src/modules/games/gamesModule.tsx`:

```tsx
import { Gamepad2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { CategoryModule } from '../types';

export const gamesModule: CategoryModule = {
  id: 'games',
  displayName: 'Games',
  singularName: 'Game',
  description: 'Track video game progress',
  endpoint: '/api/v1/games',
  icon: Gamepad2,
  color: {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    button: 'bg-cyan-600 shadow-cyan-600/30 hover:bg-cyan-500',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    iconText: 'text-cyan-400',
    borderHover: 'hover:border-cyan-500/40',
    shadow: 'shadow-cyan-600/30',
    accentText: 'text-cyan-300',
  },
  statuses: [
    { value: 'watching', label: 'Playing' },
    { value: 'completed', label: 'Completed' },
    { value: 'plan_to_watch', label: 'Plan to Play' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'on_hold', label: 'On Hold' },
  ],
  defaultStatus: 'watching',
  api: {
    getAll: async () => (await apiClient.get('/api/v1/games/list')).data,
    getById: async (id) => (await apiClient.get(`/api/v1/games/list/${id}`)).data,
    create: async (data) => {
      const catalog = await apiClient.post('/api/v1/games', { title: data.title });
      const list = await apiClient.post('/api/v1/games/list', {
        id: catalog.data.id,
        status: data.status,
        rating: data.rating,
        notes: data.notes,
      });
      return list.data;
    },
    update: async (id, data) => (await apiClient.put(`/api/v1/games/list/${id}`, data)).data,
    delete: async (id) => {
      await apiClient.delete(`/api/v1/games/list/${id}`);
    },
  },
  getDefaultFormState: () => ({}),
  FormFields: () => null,
  CardDetails: () => null,
};
```

### Step 2: Register in `src/modules/registry.ts`

```ts
import { gamesModule } from './games/gamesModule';

registerCategoryModule(gamesModule);
```

### Step 3: Re-export from `src/modules/index.ts`

```ts
export * from './games/gamesModule';
```

That's it! The sidebar, dashboard, category routes, and search will pick up the new module. Pair it with a matching `core.CategoryModule` on the backend so `GET /api/v1/categories` advertises the same endpoint.

---

## Routes Overview

| Path | Description | Auth Required |
| --- | --- | --- |
| `/` | Stats dashboard (sign-in prompt when logged out) | No |
| `/search` | Global public-catalog search (`Ctrl/⌘ + K`) | No |
| `/:category` | Browse a public category catalog (personal list when signed in) | No |
| `/:category/new` | Create a catalog item and add it to your list | Yes |
| `/:category/:itemId` | View a public catalog item; edit/add requires sign-in | No |
