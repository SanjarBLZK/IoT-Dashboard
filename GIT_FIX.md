# 🔧 Git Authentication Fix

## ❌ Probleem
```
remote: Invalid username or token. Password authentication is not supported for Git operations.
fatal: Authentication failed for 'https://github.com/SanjarBLZK/IoT-Dashboard.git/'
```

GitHub accepteert geen wachtwoorden meer voor Git operaties. Je moet een **Personal Access Token (PAT)** gebruiken.

---

## ✅ Oplossing A: Personal Access Token (Aanbevolen)

### Stap 1: Maak een GitHub Personal Access Token

1. Ga naar GitHub.com en log in
2. Klik op je profiel foto (rechts boven) → **Settings**
3. Scroll helemaal naar beneden → **Developer settings**
4. Klik op **Personal access tokens** → **Tokens (classic)**
5. Klik **Generate new token** → **Generate new token (classic)**
6. Vul in:
   ```
   Note: IoT Dashboard Git Access
   Expiration: 90 days (of No expiration)
   
   Scopes (vink aan):
   ✅ repo (all)
   ```
7. Klik **Generate token**
8. **KOPIEER DE TOKEN NU** (je ziet hem maar 1 keer!)
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Stap 2: Update Git Credentials

**Optie A: Via Command Line**

```powershell
# 1. Verwijder oude credentials
git config --global --unset credential.helper

# 2. Stel GitHub credentials in
git config --global credential.helper manager-core

# 3. Push opnieuw (je wordt gevraagd om username + token)
git push origin main

# Username: SanjarBLZK
# Password: [PLAK JE TOKEN HIER]
```

**Optie B: Update Remote URL met Token**

```powershell
# Huidige remote URL (met https)
git remote -v
# origin  https://github.com/SanjarBLZK/IoT-Dashboard.git

# Update naar nieuwe URL met token
git remote set-url origin https://ghp_JOUW_TOKEN_HIER@github.com/SanjarBLZK/IoT-Dashboard.git

# Test
git push origin main
```

### Stap 3: Test of het werkt

```powershell
# Stage alle changes
git add .

# Commit
git commit -m "Add Supabase documentation and memorybank"

# Push
git push origin main
```

✅ Als het werkt zie je: "Everything up-to-date" of success message

---

## ✅ Oplossing B: SSH Keys (Veiliger voor lange termijn)

### Stap 1: Genereer SSH Key

```powershell
# Check of je al een SSH key hebt
Get-ChildItem ~\.ssh

# Als geen id_rsa.pub bestaat, maak nieuwe key aan
ssh-keygen -t ed25519 -C "jouw-email@example.com"
# Druk 3x Enter (geen passphrase voor gemak)
```

### Stap 2: Kopieer Public Key

```powershell
# Toon public key
Get-Content ~\.ssh\id_ed25519.pub
# Of voor RSA:
Get-Content ~\.ssh\id_rsa.pub

# Kopieer de output (begint met ssh-ed25519 of ssh-rsa)
```

### Stap 3: Voeg toe aan GitHub

1. Ga naar GitHub.com → **Settings**
2. **SSH and GPG keys**
3. **New SSH key**
4. Title: `IoT Dashboard - Windows PC`
5. Key: [plak je public key]
6. **Add SSH key**

### Stap 4: Change Remote URL naar SSH

```powershell
# Check huidige URL
git remote -v

# Change naar SSH
git remote set-url origin git@github.com:SanjarBLZK/IoT-Dashboard.git

# Test SSH connection
ssh -T git@github.com
# Output: "Hi SanjarBLZK! You've successfully authenticated..."

# Push
git push origin main
```

---

## ✅ Oplossing C: GitHub Desktop (Makkelijkste)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Installeer en log in met je GitHub account
3. **File** → **Add Local Repository**
4. Selecteer: `C:\Users\sanja\OneDrive\Documenten\IoT-Dashboard`
5. Klik **Publish repository** of **Push origin**

✅ GitHub Desktop handelt authenticatie automatisch af!

---

## 🔒 Welke Oplossing Kiezen?

| Methode | Moeilijkheid | Veiligheid | Aanbeveling |
|---------|--------------|------------|-------------|
| Personal Access Token | ⭐⭐ Gemiddeld | ⭐⭐⭐ Goed | ✅ Voor nu |
| SSH Keys | ⭐⭐⭐ Moeilijk | ⭐⭐⭐⭐⭐ Best | ✅ Lange termijn |
| GitHub Desktop | ⭐ Makkelijk | ⭐⭐⭐⭐ Uitstekend | ✅ Beginners |

**Mijn advies**: Start met **Personal Access Token** (Oplossing A) omdat het snel is.

---

## 🧪 Quick Test Script

```powershell
# Test of git werkt
cd "C:\Users\sanja\OneDrive\Documenten\IoT-Dashboard"

# Check status
git status

# Test remote connection
git ls-remote origin

# Als dit werkt zonder error → Git is fixed! ✅
```

---

## 🐛 Troubleshooting

### "fatal: could not read Username"
→ Gebruik Oplossing B (SSH) of C (GitHub Desktop)

### "remote: Support for password authentication was removed"
→ Je gebruikt nog steeds wachtwoord i.p.v. token. Herhaal Stap 2 van Oplossing A

### Token verlopen
→ Ga naar GitHub Settings → Personal Access Tokens → Regenerate token

### SSH "Permission denied (publickey)"
→ Check of je public key correct is toegevoegd aan GitHub
→ Test met: `ssh -T git@github.com`

---

## ✅ Verificatie Checklist

Na één van de oplossingen:

```powershell
# 1. Check remote URL
git remote -v

# 2. Check credentials
git config --list | Select-String credential

# 3. Test push
git push origin main

# 4. Verwacht output:
# "Everything up-to-date" of
# "Branch 'main' set up to track remote branch 'main' from 'origin'"
```

---

## 📝 Voor de Toekomst

**Bewaar je Personal Access Token veilig:**
- Gebruik password manager (1Password, Bitwarden)
- Of bewaar in `.env.local` file (NIET in git!)
- Of gebruik SSH keys (geen token nodig)

**Credential Helper instellen (eenmalig):**
```powershell
# Windows Credential Manager gebruiken
git config --global credential.helper manager-core

# Dan wordt je token automatisch opgeslagen na eerste keer
```

---

## 🆘 Hulp Nodig?

Als bovenstaande niet werkt:

1. Check GitHub Status: https://www.githubstatus.com/
2. Test internet connectie
3. Probeer via GitHub Desktop (altijd een fallback)
4. Check firewall/antivirus settings

---

**🎯 Volg Oplossing A (Personal Access Token) voor snelste fix!**
