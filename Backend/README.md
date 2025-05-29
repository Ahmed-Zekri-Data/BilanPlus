# Bilan+ Backend

## Mode Développement

Le backend est configuré pour fonctionner en mode développement, ce qui désactive la vérification des tokens JWT et des permissions. Cela permet de développer le frontend sans avoir besoin d'un backend complet.

### Authentification

En mode développement, l'authentification est simulée avec un utilisateur fictif ayant des permissions d'administrateur. Cela permet de tester toutes les fonctionnalités sans avoir besoin de s'authentifier.

### Permissions

En mode développement, toutes les permissions sont accordées automatiquement. Cela permet de tester toutes les fonctionnalités sans avoir besoin de configurer des rôles et des permissions.

### Configuration

Pour désactiver le mode développement et activer la vérification normale des tokens JWT et des permissions, modifiez les fichiers suivants :

1. `Backend/MiddleWare/Auth.js` :
   - Remplacez `const isDevelopmentMode = process.env.NODE_ENV === 'development' || true;` par `const isDevelopmentMode = process.env.NODE_ENV === 'development';`
   - Ou définissez la variable d'environnement `NODE_ENV` à `production`

## Mode Production

En mode production, le backend vérifie les tokens JWT et les permissions normalement. Cela garantit que seuls les utilisateurs authentifiés et autorisés peuvent accéder aux fonctionnalités.

### Authentification

En mode production, l'authentification est effectuée en vérifiant le token JWT fourni dans l'en-tête `Authorization` de la requête. Le token doit être au format `Bearer <token>`.

### Permissions

En mode production, les permissions sont vérifiées en fonction du rôle de l'utilisateur. Seuls les utilisateurs ayant les permissions requises peuvent accéder aux fonctionnalités.

### Configuration

Pour activer le mode production, modifiez les fichiers suivants :

1. `Backend/MiddleWare/Auth.js` :
   - Remplacez `const isDevelopmentMode = process.env.NODE_ENV === 'development' || true;` par `const isDevelopmentMode = process.env.NODE_ENV === 'development';`
   - Ou définissez la variable d'environnement `NODE_ENV` à `production`
