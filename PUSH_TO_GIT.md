# Instructions pour pousser votre projet sur Git

Votre projet est maintenant prêt avec un commit initial. Suivez ces étapes pour le pousser sur GitHub, GitLab ou Bitbucket.

## 🐙 Option 1 : GitHub (Recommandé)

### Étape 1 : Créer un nouveau dépôt sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"+"** en haut à droite > **"New repository"**
3. Donnez un nom à votre dépôt (ex: `vtc-app` ou `projet-vtc`)
4. Choisissez **Public** ou **Private**
5. ⚠️ **NE COCHEZ PAS** "Initialize this repository with a README" (votre projet a déjà un README)
6. Cliquez sur **"Create repository"**

### Étape 2 : Connecter votre dépôt local au dépôt GitHub

Copiez l'URL de votre dépôt (format HTTPS ou SSH) et exécutez ces commandes :

```bash
# Remplacez VOTRE_USERNAME et VOTRE_REPO par vos valeurs
git remote add origin https://github.com/VOTRE_USERNAME/VOTRE_REPO.git

# Ou avec SSH (si vous avez configuré SSH) :
# git remote add origin git@github.com:VOTRE_USERNAME/VOTRE_REPO.git

# Vérifier que le remote est bien configuré
git remote -v

# Pousser votre code
git branch -M main
git push -u origin main
```

---

## 🦊 Option 2 : GitLab

### Étape 1 : Créer un nouveau dépôt sur GitLab

1. Allez sur [gitlab.com](https://gitlab.com) et connectez-vous
2. Cliquez sur **"New project"** ou **"Create project"**
3. Choisissez **"Create blank project"**
4. Donnez un nom à votre projet
5. Choisissez **Public** ou **Private**
6. ⚠️ **DÉCOCHEZ** "Initialize repository with a README"
7. Cliquez sur **"Create project"**

### Étape 2 : Connecter et pousser

```bash
git remote add origin https://gitlab.com/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

---

## 🔷 Option 3 : Bitbucket

### Étape 1 : Créer un nouveau dépôt sur Bitbucket

1. Allez sur [bitbucket.org](https://bitbucket.org) et connectez-vous
2. Cliquez sur **"Create"** > **"Repository"**
3. Donnez un nom à votre dépôt
4. Choisissez **Private** ou **Public**
5. ⚠️ **DÉCOCHEZ** "Include a README?"
6. Cliquez sur **"Create repository"**

### Étape 2 : Connecter et pousser

```bash
git remote add origin https://bitbucket.org/VOTRE_USERNAME/VOTRE_REPO.git
git branch -M main
git push -u origin main
```

---

## ⚡ Commandes rapides (une fois le remote configuré)

Une fois que vous avez configuré le remote, vous pouvez utiliser ces commandes :

```bash
# Vérifier le statut
git status

# Ajouter des fichiers modifiés
git add .

# Créer un commit
git commit -m "Description de vos modifications"

# Pousser vers le dépôt distant
git push

# Pour la première fois seulement
git push -u origin main
```

---

## 🔐 Configuration Git (optionnel mais recommandé)

Si vous souhaitez configurer votre nom et email Git :

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

Pour vérifier votre configuration :
```bash
git config --list
```

---

## ❓ Problèmes courants

### Erreur : "remote origin already exists"
Si vous avez déjà un remote, supprimez-le d'abord :
```bash
git remote remove origin
git remote add origin VOTRE_NOUVELLE_URL
```

### Erreur : "Authentication failed"
- Vérifiez votre nom d'utilisateur et mot de passe
- Pour GitHub, vous devrez peut-être utiliser un **Personal Access Token** au lieu de votre mot de passe
- Configurez SSH pour éviter de saisir les identifiants à chaque fois

### Erreur : "Permission denied"
- Vérifiez que vous avez les droits d'écriture sur le dépôt
- Vérifiez que vous êtes connecté avec le bon compte

---

## ✅ Vérification

Après avoir poussé votre code, vérifiez sur la plateforme :
- ✅ Tous vos fichiers sont présents
- ✅ Le README.md s'affiche correctement
- ✅ Le .gitignore exclut bien les fichiers sensibles (pas de .env visible)

Bon push ! 🚀


