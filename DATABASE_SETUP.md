# Database Connection String

For Render PostgreSQL databases, the connection string format is:
`postgresql://username:password@host:port/database`

Your database details:
- Host: dpg-d49480euk2gs73es30o0-a.oregon-postgres.render.com
- Port: 5432
- Database: mangotrades_db
- User: mangotrades_db_user
- Password: [Retrieved from Render dashboard]

To link the database:
1. Go to: https://dashboard.render.com/web/srv-d49lgdfgi27c73ce1fq0/environment
2. Click "Link Database" button
3. Select "mangotrades-db"
4. This will automatically add DATABASE_URL environment variable

Alternatively, you can manually add DATABASE_URL:
postgresql://mangotrades_db_user:[PASSWORD]@dpg-d49480euk2gs73es30o0-a.oregon-postgres.render.com:5432/mangotrades_db

The password can be found in the Render dashboard under the database settings.

