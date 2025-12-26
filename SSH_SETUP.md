# SSH Key Setup for GitHub

## ✅ SSH Key Generated!

Your SSH key has been generated. Follow these steps:

## Step 1: Add SSH Key to GitHub

1. **Copy your public key** (it's displayed above, or run):
   ```bash
   cat ~/.ssh/id_ed25519_github.pub
   ```

2. **Go to GitHub:**
   - Visit: https://github.com/settings/keys
   - Or: GitHub → Your Profile → Settings → SSH and GPG keys

3. **Add the key:**
   - Click "New SSH key"
   - **Title:** `MyHub Development` (or any name you like)
   - **Key type:** Authentication Key
   - **Key:** Paste your public key (the entire output from step 1)
   - Click "Add SSH key"

## Step 2: Update Git Remote to Use SSH

The remote will be updated automatically, but you can verify:

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git remote set-url origin git@github.com:prajwalshetty1/myhub.git
git remote -v
```

## Step 3: Test SSH Connection

```bash
ssh -T git@github.com
```

You should see:
```
Hi prajwalshetty1! You've successfully authenticated...
```

## Step 4: Push to GitHub

```bash
cd /Users/prajwal/Desktop/Cursor/MyHub
git push -u origin main
```

No password needed! 🎉

## Troubleshooting

### "Permission denied (publickey)"
- Make sure you added the public key to GitHub
- Verify the key is in ssh-agent: `ssh-add -l`
- Try: `ssh-add ~/.ssh/id_ed25519_github`

### "Host key verification failed"
- Add GitHub to known_hosts:
  ```bash
  ssh-keyscan github.com >> ~/.ssh/known_hosts
  ```

### "Could not resolve hostname"
- Check your internet connection
- Try: `ping github.com`

## Your SSH Key Location

- **Private key:** `~/.ssh/id_ed25519_github` (keep this secret!)
- **Public key:** `~/.ssh/id_ed25519_github.pub` (this is what you add to GitHub)

## Security Notes

- Never share your private key
- The private key stays on your computer
- Only the public key goes to GitHub
- You can use the same key for multiple repositories

