#!/bin/bash
# Script to link database and complete Render configuration

echo "🔗 Linking Database to Backend Service..."

# Use Render API to link database
# Note: Render requires linking via dashboard for security, but we can prepare the connection

SERVICE_ID="srv-d49lgdfgi27c73ce1fq0"
DB_ID="dpg-d49480euk2gs73es30o0-a"
API_KEY="rnd_CzMjLrxGNIiz258bWrU4Pe19E0E0"

echo "✅ Configuration Summary:"
echo "Backend Service: https://podcast-platform-backend.onrender.com"
echo "Frontend Service: https://podcast-platform-frontend.onrender.com"
echo "Database: mangotrades-db"
echo ""
echo "📋 To complete database linking:"
echo "1. Go to: https://dashboard.render.com/web/$SERVICE_ID/environment"
echo "2. Click 'Link Database' button"
echo "3. Select 'mangotrades-db'"
echo "4. This will automatically add DATABASE_URL"
echo ""
echo "✅ Environment variables already set:"
echo "- JWT_SECRET"
echo "- LINKEDIN_CALLBACK_URL"
echo "- All MinIO settings"
echo "- Frontend/Backend URLs"
echo ""
echo "⚠️  Still need to set manually:"
echo "- LINKEDIN_CLIENT_ID (from LinkedIn Developers)"
echo "- LINKEDIN_CLIENT_SECRET (from LinkedIn Developers)"
echo "- REACT_APP_API_URL (for frontend)"

