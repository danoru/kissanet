# Kissa — a listening room

A personal vinyl collection browsed the way you'd browse a real crate: records
stand spine-out on a shelf, you pull one toward the light to read its sleeve,
then **put it on** a virtual turntable that streams through Spotify.

The name comes from _jazz kissa_ (ジャズ喫茶) — Japanese listening cafés known for
dim lighting, curated vinyl, and treating the music as the main event. The whole
UI is meant to feel like walking into one of those rooms late at night: warm
near-black, candlelight amber, film grain, nothing in a hurry.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a CSS-custom-property token layer (channel-based so
  opacity modifiers work)
- **Framer Motion** for the shelf → cover → turntable transitions
- **Prisma** + **Supabase** (Postgres) for the collection
- **Spotify Web Playback SDK** (PKCE OAuth) for playback
- **MusicBrainz** + **Cover Art Archive** for album metadata and artwork

## Running it

```bash
npm install
cp .env.example .env   # fill in what you have; everything degrades gracefully
npm run dev
```

Open http://localhost:3000. **With no configuration at all it still runs** — the
shelf serves a few mock jazz records and the turntable spins in silence.

### Database (optional, for a real collection)

Point `DATABASE_URL` at a Supabase/Postgres instance, then:

```bash
npx prisma migrate dev --name init   # create the tables
```

Once a database is connected, records added via **/add** persist, play counts
are tracked, and the shelf reads from the DB instead of the mock data.

### Spotify (optional, for sound)

1. Create an app at https://developer.spotify.com/dashboard
2. Add `http://localhost:3000/api/spotify/callback` as a Redirect URI
3. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_REDIRECT_URI` in `.env`
4. In the player view, choose **connect spotify** (PKCE flow; tokens are stored
   server-side in an httpOnly cookie and, when present, the `SpotifySession`
   table — never in `localStorage`)

Playback requires Spotify **Premium**. Each album stores a `spotify:album:…` URI
(pasted on the add form for now) which is what gets put on.

## How it's organized

```
app/
  page.tsx                  the room (shelf)
  add/page.tsx              add a record
  api/albums/…              collection CRUD (+ mark-played)
  api/search/…              MusicBrainz proxy
  api/spotify/…             PKCE OAuth, callback, token endpoint
components/
  ui/        RoomLayout, GrainOverlay          — the room's chrome
  shelf/     ShelfView, VinylSpine, SpineLabel — the crate + interaction
  album/     AlbumCover, AlbumDetails          — the pulled-out state
  player/    RecordPlayer, NowPlaying, SpotifyPlayerContext
  add/       AddRecord                         — search + form
lib/
  types, mock, color, dominantColor, prisma, albums, spotify
```

## Design tokens

Defined once in `app/globals.css` and consumed through Tailwind:

| token       | hex       | role                         |
| ----------- | --------- | ---------------------------- |
| `room`      | `#0f0d0b` | the room (near-black, warm)  |
| `shelf`     | `#1c1712` | shelf / surface              |
| `wood`      | `#2e2218` | card / panel backgrounds     |
| `amber`     | `#c8832a` | primary accent (candlelight) |
| `amber-dim` | `#8a5a1e` | secondary accent             |
| `cream`     | `#e8d9b8` | primary text                 |
| `muted`     | `#8a7a62` | secondary text               |
| `groove`    | `#3d3020` | borders / dividers           |

Display serif is Cormorant Garamond; body is Inter; metadata is JetBrains Mono.
No white backgrounds, no pure black — everything has warmth. All motion respects
`prefers-reduced-motion`.
