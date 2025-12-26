# Personal Access Token Setup - Step by Step

## Quick Steps

### 1. Create Token on GitHub

1. **Open this link:** https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token"** → **"Generate new token (classic)"**

3. **Fill in the form:**
   - **Note:** `MyHub Deployment`
   - **Expiration:** Choose (90 days is good)
   - **Select scopes:** Check `repo` (this gives full repository access)

4. **Click "Generate token"** at the bottom

5. **IMPORTANT:** Copy the token immediately! It looks like:
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   You won't be able to see it again!

### 2. Use the Token to Push

**Option A: Use the helper script**
```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
./push-to-github.sh
```

**Option B: Push manually**
```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git push -u origin main
```

When prompted:
- **Username:** `prajwalshetty1`
- **Password:** Paste your token (the `ghp_...` string)

### 3. Verify

After successful push:
- Visit: https://github.com/prajwalshetty1/myhub
- You should see all your files!

## Troubleshooting

### "Authentication failed"
- Make sure you're using the token, not your GitHub password
- Verify the token has `repo` scope
- Check the token hasn't expired

### "Permission denied"
- Verify you have write access to the repository
- Check the token is for the correct GitHub account

### "Repository not found"
- Make sure the repository exists at https://github.com/prajwalshetty1/myhub
- Verify the repository name is correct

## Security Note

- **Never commit tokens to git!**
- Tokens are stored in your system's credential helper
- You can revoke tokens at: https://github.com/settings/tokens

## Next Steps After Push

Once code is on GitHub:
1. Set up Supabase (see DEPLOYMENT.md)
2. Deploy to Vercel (see VERCEL_SETUP.md)
3. Configure environment variables
4. Test your deployment!

