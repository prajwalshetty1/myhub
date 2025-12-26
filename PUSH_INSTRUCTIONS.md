# Push to GitHub - Authentication Required

GitHub requires authentication to push. Here are your options:

## Option 1: Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: "MyHub Deployment"
   - Select scope: `repo` (full control)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   cd /Users/prajwal/Desktop/Cursor/MyHub
   git push -u origin main
   ```
   
   When prompted:
   - **Username:** `prajwalshetty1`
   - **Password:** Paste your Personal Access Token (not your GitHub password)

## Option 2: Use SSH (If you have SSH keys set up)

```bash
# Change remote to SSH
cd /Users/prajwal/Desktop/Cursor/MyHub
git remote set-url origin git@github.com:prajwalshetty1/myhub.git

# Push
git push -u origin main
```

## Option 3: Use GitHub CLI

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Push
cd /Users/prajwal/Desktop/Cursor/MyHub
git push -u origin main
```

## Quick Command

After setting up authentication, run:

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git push -u origin main
```

## Verify

After pushing, check:
- https://github.com/prajwalshetty1/myhub
- You should see all your files

