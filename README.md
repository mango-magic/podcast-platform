# Podcast Platform

A complete B2B podcast platform for recording, editing, and distributing podcasts.

## Features

- 🔐 LinkedIn OAuth authentication
- 🎙️ Browser-based recording (audio + video)
- 📁 File upload and storage (MinIO/S3-compatible)
- 📝 Episode management
- 🎬 Clip generation
- 📡 RSS feed generation
- 🚀 Auto-distribution to social media platforms
- 🤖 AI-powered transcription and editing (coming soon)

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (Sequelize ORM)
- MinIO (S3-compatible storage)
- Passport.js (LinkedIn OAuth)
- JWT authentication

### Frontend
- React 18
- Material-UI
- RecordRTC (browser recording)
- React Router

### Infrastructure
- Docker & Docker Compose
- Render (hosting)
- PostgreSQL (database)

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- LinkedIn Developer App credentials

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd podcast-platform
```

2. Set up backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run sync-db
npm run dev
```

3. Set up frontend:
```bash
cd frontend
cp .env.example .env
# Edit .env with API URL
npm install
npm start
```

4. Or use Docker Compose:
```bash
docker-compose up
```

### Environment Variables

#### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/podcast_db
JWT_SECRET=your-secret-key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=podcasts
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3001
API_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3000
```

## Deployment

### Render Deployment

1. Push code to GitHub
2. Connect repository to Render
3. Render will automatically detect `render.yaml` and deploy services
4. Set environment variables in Render dashboard
5. Database will be automatically provisioned

### Manual Deployment

1. Build backend:
```bash
cd backend
docker build -t podcast-backend .
```

2. Build frontend:
```bash
cd frontend
docker build -t podcast-frontend .
```

3. Deploy to your hosting provider

## API Documentation

### Authentication
- `GET /auth/linkedin` - Initiate LinkedIn OAuth
- `GET /auth/linkedin/callback` - OAuth callback
- `GET /auth/me` - Get current user (requires auth)

### Podcasts
- `GET /api/podcasts` - List user's podcasts
- `POST /api/podcasts` - Create podcast
- `GET /api/podcasts/:id` - Get podcast
- `PUT /api/podcasts/:id` - Update podcast
- `DELETE /api/podcasts/:id` - Delete podcast

### Episodes
- `GET /api/episodes` - List episodes
- `POST /api/episodes` - Create episode
- `GET /api/episodes/:id` - Get episode
- `PUT /api/episodes/:id` - Update episode
- `DELETE /api/episodes/:id` - Delete episode

### Upload
- `POST /api/upload/episode` - Upload episode file
- `POST /api/upload/cover` - Upload cover image
- `POST /api/upload/clip` - Upload clip file

### RSS
- `GET /rss/:podcastId` - Get RSS feed for podcast

## Project Structure

```
podcast-platform/
├── backend/
│   ├── routes/          # API routes
│   ├── models/          # Database models
│   ├── middleware/      # Auth middleware
│   ├── services/        # Business logic
│   ├── config/          # Configuration
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── contexts/    # React contexts
│   └── public/          # Static files
├── ai-services/         # AI processing (coming soon)
├── docker-compose.yml   # Docker setup
└── render.yaml          # Render deployment config
```

## Development

### Running Tests
```bash
# Backend tests (coming soon)
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend
npm run sync-db
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

