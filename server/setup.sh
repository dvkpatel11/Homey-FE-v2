#!/bin/bash

# Homey Mock Server Setup
echo "🎭 Setting up Homey Mock Server..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Mock server setup complete!"
echo ""
echo "🚀 Start the server with:"
echo "   npm start      (production)"
echo "   npm run dev    (development with auto-reload)"
echo ""
echo "📍 Server will run at: http://localhost:8000"
echo "🔧 Health check: http://localhost:8000/health"
echo ""
echo "💡 Update your frontend env:"
echo "   VITE_API_BASE_URL=http://localhost:8000"
