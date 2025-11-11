# Backend Dependencies

This directory contains the backend API server for the Podcast Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. Set up database:
```bash
npm run sync-db
```

4. Start development server:
```bash
npm run dev
```

5. Start production server:
```bash
npm start
```

## Environment Variables

See `.env.example` for required environment variables.

## API Endpoints

- `GET /health` - Health check
- `GET /auth/linkedin` - Initiate LinkedIn OAuth
- `GET /auth/linkedin/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

- `GET /api/podcasts` - List podcasts
- `POST /api/podcasts` - Create podcast
- `GET /api/podcasts/:id` - Get podcast
- `PUT /api/podcasts/:id` - Update podcast
- `DELETE /api/podcasts/:id` - Delete podcast

- `GET /api/episodes` - List episodes
- `POST /api/episodes` - Create episode
- `GET /api/episodes/:id` - Get episode
- `PUT /api/episodes/:id` - Update episode
- `DELETE /api/episodes/:id` - Delete episode

- `POST /api/upload/episode` - Upload episode file
- `POST /api/upload/cover` - Upload cover image
- `POST /api/upload/clip` - Upload clip file

- `GET /api/guests` - List guests
- `POST /api/guests` - Create guest
- `GET /api/guests/:id` - Get guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest

- `GET /api/clips` - List clips
- `POST /api/clips` - Create clip
- `GET /api/clips/:id` - Get clip
- `PUT /api/clips/:id` - Update clip
- `DELETE /api/clips/:id` - Delete clip

- `GET /api/distributions` - List distributions
- `POST /api/distributions` - Create distribution

- `GET /rss/:podcastId` - Get RSS feed

