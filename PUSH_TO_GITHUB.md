# Push to GitHub

Quick guide to push your code to GitHub.

## Option 1: Using HTTPS (Recommended for first time)

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub

# Check status
git status

# Add all files
git add .

# Commit changes
git commit -m "Configure for Supabase and Vercel deployment"

# Push to GitHub
git push -u origin main
```

If you get authentication errors, GitHub may prompt you for:
- **Username:** `prajwalshetty1`
- **Password:** Use a Personal Access Token (not your GitHub password)

### Create Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "MyHub Deployment"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

## Option 2: Using SSH

If you have SSH keys set up:

```bash
# Change remote to SSH
git remote set-url origin git@github.com:prajwalshetty1/myhub.git

# Push
git push -u origin main
```

## Option 3: Using GitHub CLI

```bash
# Install GitHub CLI if not installed
# brew install gh (macOS)

# Authenticate
gh auth login

# Push
git push -u origin main
```

## Verify Push

After pushing, check:
- https://github.com/prajwalshetty1/myhub
- You should see all your files

## Next Steps

After code is on GitHub:

1. **Set up Supabase** (see DEPLOYMENT.md)
2. **Deploy to Vercel** (see VERCEL_SETUP.md)
3. **Configure environment variables**
4. **Test deployment**

## Troubleshooting

### "Repository not found"
- Verify repository exists at https://github.com/prajwalshetty1/myhub
- Check you have write access
- Try creating the repository on GitHub first (if it's empty)

### "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys

### "Permission denied"
- Check you're logged into correct GitHub account
- Verify repository ownership

### "Remote origin already exists"
```bash
# Remove and re-add
git remote remove origin
git remote add origin https://github.com/prajwalshetty1/myhub.git
```

