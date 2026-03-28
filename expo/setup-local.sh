#!/bin/bash

# MindCare App - Local Development Setup Script
# This script helps configure the app for local development

echo "🚀 Setting up MindCare App for local development..."

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install Expo CLI if not present
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
else
    echo "✅ Expo CLI is already installed"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Check for EAS CLI
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI for building..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI is already installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 Manual steps required:"
echo "1. Update package.json scripts (see DEVELOPMENT_CONFIG.md)"
echo "2. Update app.json configuration (see DEVELOPMENT_CONFIG.md)"
echo "3. Create eas.json file (see DEVELOPMENT_CONFIG.md)"
echo ""
echo "🚀 After manual configuration, run:"
echo "   npm start          # Start development server"
echo "   npm run android    # Run on Android"
echo "   npm run ios        # Run on iOS"
echo "   npm run web        # Run on web"
echo ""
echo "📖 See LOCAL_SETUP_GUIDE.md for detailed instructions"