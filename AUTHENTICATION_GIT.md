# Authentification Git pour GitHub

Pour pousser votre code vers GitHub, vous devez vous authentifier. Voici les options :

## 🔐 Option 1 : Personal Access Token (Recommandé)

### Étape 1 : Créer un token GitHub

1. Allez sur GitHub.com > **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Donnez un nom à votre token (ex: "VTC App")
4. Sélectionnez les permissions : cochez au minimum **`repo`** (accès complet aux dépôts)
5. Cliquez sur **"Generate token"**
6. ⚠️ **COPIEZ LE TOKEN** (il ne sera affiché qu'une seule fois !)

### Étape 2 : Utiliser le token

Quand Git vous demande votre mot de passe, utilisez le **token** au lieu de votre mot de passe GitHub.

```bash
git push -u origin main
# Username: yassineC4
# Password: [collez votre token ici]
```

---

## 🔑 Option 2 : Configuration SSH (Plus sécurisé et pratique)

### Étape 1 : Vérifier si vous avez déjà une clé SSH

```bash
ls -al ~/.ssh
```

Si vous voyez `id_rsa.pub` ou `id_ed25519.pub`, vous avez déjà une clé.

### Étape 2 : Créer une clé SSH (si nécessaire)

```bash
ssh-keygen -t ed25519 -C "votre.email@example.com"
# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Entrez un mot de passe (optionnel mais recommandé)
```

### Étape 3 : Ajouter la clé à ssh-agent

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### Étape 4 : Copier votre clé publique

```bash
cat ~/.ssh/id_ed25519.pub
# Copiez tout le contenu affiché
```

### Étape 5 : Ajouter la clé sur GitHub

1. Allez sur GitHub.com > **Settings** > **SSH and GPG keys**
2. Cliquez sur **"New SSH key"**
3. Donnez un titre (ex: "MacBook")
4. Collez votre clé publique
5. Cliquez sur **"Add SSH key"**

### Étape 6 : Changer l'URL du remote pour utiliser SSH

```bash
git remote set-url origin git@github.com:yassineC4/Vtc.git
git push -u origin main
```

---

## 💻 Option 3 : Git Credential Manager (macOS)

macOS peut stocker vos identifiants automatiquement :

```bash
git config --global credential.helper osxkeychain
git push -u origin main
# Entrez vos identifiants une fois, ils seront sauvegardés
```

---

## ⚡ Commande rapide avec token inline

Si vous avez un token, vous pouvez l'utiliser directement dans l'URL :

```bash
git remote set-url origin https://VOTRE_TOKEN@github.com/yassineC4/Vtc.git
git push -u origin main
```

⚠️ **Attention** : Cette méthode expose votre token dans l'historique Git. Utilisez-la uniquement si vous comprenez les risques.

---

## ✅ Vérification

Après avoir poussé avec succès, vérifiez sur GitHub :
- ✅ Votre code est visible sur https://github.com/yassineC4/Vtc
- ✅ Le README.md s'affiche
- ✅ Tous les fichiers sont présents

---

## 🆘 Problèmes courants

### "fatal: could not read Username"
→ Vous devez configurer l'authentification (voir options ci-dessus)

### "Permission denied"
→ Vérifiez que vous avez les droits d'écriture sur le dépôt
→ Vérifiez que votre token/SSH a les bonnes permissions

### "repository not found"
→ Vérifiez que le dépôt existe sur GitHub
→ Vérifiez que vous utilisez le bon nom d'utilisateur et nom de dépôt


