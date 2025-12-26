#!/bin/bash

# MyHub - Push to GitHub Helper Script

echo "🚀 MyHub - Push to GitHub"
echo "=========================="
echo ""
echo "Step 1: Create a Personal Access Token"
echo "----------------------------------------"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Name: 'MyHub Deployment'"
echo "4. Select scope: 'repo' (full control)"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN (you won't see it again!)"
echo ""
echo "Press Enter when you have your token ready..."
read

echo ""
echo "Step 2: Push to GitHub"
echo "----------------------"
echo "You'll be prompted for:"
echo "  Username: prajwalshetty1"
echo "  Password: (paste your Personal Access Token)"
echo ""

cd "$(dirname "$0")"

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Not in MyHub directory"
    exit 1
fi

# Check git status
echo "📋 Current git status:"
git status --short
echo ""

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Code pushed to GitHub"
    echo "🌐 View at: https://github.com/prajwalshetty1/myhub"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Wrong username or token"
    echo "   - Token doesn't have 'repo' scope"
    echo "   - Network issues"
    echo ""
    echo "Try again or check PUSH_INSTRUCTIONS.md for help"
fi

