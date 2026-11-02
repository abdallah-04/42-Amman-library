# 42 Amman Library

A mobile + web app for borrowing and returning books from the 42 Amman campus library. Built with React Native (Expo) and a self-hosted PocketBase backend.

## Features

- **Browse & search** the campus library in a grid, with pull-to-refresh
- **Borrow and return** books, with a 30-day countdown / progress bar and overdue state
- **Add books** by searching the [Open Library](https://openlibrary.org) API, or manually with a photo
- **Ratings & reviews** after returning a book; the book's rating is a running weighted average
- **Profile** showing books you're currently borrowing and books you added
- Runs on **iOS, Android and web** from one codebase

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React Native, Expo Router, TypeScript |
| Backend | [PocketBase](https://pocketbase.io) (SQLite, self-hosted) |
| Book data | Open Library API |
| Web build | Expo web export (static) |

## Project structure

```
app/             Screens (Expo Router): login, library, add books, profile, book detail, rate & return
components/      Reusable UI components
constants/       Design tokens (Colors.ts)
services/        pocketbase.ts - all backend calls
pb_migrations/   PocketBase schema migrations (collections: book, borrow)
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [PocketBase](https://pocketbase.io/docs/) binary for your OS
- [Expo Go](https://expo.dev/go) on your phone (optional, for testing on a device)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PocketBase

Download PocketBase from <https://pocketbase.io/docs/> and place the executable in the project root, then:

```bash
./pocketbase serve --http=0.0.0.0:8090
```

On first run, the migrations in `pb_migrations/` create the `book` and `borrow` collections automatically. Open the dashboard at <http://127.0.0.1:8090/_/> and create your admin account (use a strong, unique password).

### 3. Configure the app

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_BASE_URL` to where PocketBase is reachable:

| Where you run the app | Value |
|---|---|
| Web (same machine) | leave empty (defaults to `http://localhost:8090`) |
| Android emulator | `http://10.0.2.2:8090` |
| Physical phone | `http://<your-computer-LAN-IP>:8090` (phone and computer on the same Wi-Fi) |

### 4. Run the app

```bash
npm start        # Expo dev menu
npm run web      # browser
npm run android
npm run ios
```

## Known limitations

- **No authentication yet.** The login screen is a placeholder; sign-in with 42 Intra OAuth is planned.
- **Open API rules.** The `book` and `borrow` collections allow public read/write (see `pb_migrations/1777730000_open_app_collection_rules.js`). This is fine for local development, but **do not expose your PocketBase server to the public internet** until auth and proper collection rules are in place.

## Roadmap

- [ ] 42 Intra OAuth login
- [ ] Per-user collection rules (only owners can edit/delete their records)
- [ ] Hosted PocketBase for the web build

## License

[MIT](LICENSE) © Abdallah Al-Mufleh
