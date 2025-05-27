import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = 'fr'; // Langue par défaut : français

  private translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      // Général
      'welcome': 'Bienvenue',
      'login': 'Connexion',
      'logout': 'Déconnexion',
      'profile': 'Profil',
      'loading': 'Chargement...',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'search': 'Rechercher',
      'back': 'Retour',
      'add': 'Ajouter',
      'export': 'Exporter',
      'import': 'Importer',
      'filter': 'Filtrer',
      'sort': 'Trier',
      'actions': 'Actions',
      'confirm': 'Confirmer',
      'yes': 'Oui',
      'no': 'Non',
      'success': 'Succès',
      'error': 'Erreur',
      'warning': 'Avertissement',
      'info': 'Information',
      
      // Utilisateurs
      'users': 'Utilisateurs',
      'user': 'Utilisateur',
      'username': 'Nom d\'utilisateur',
      'email': 'Email',
      'password': 'Mot de passe',
      'confirmPassword': 'Confirmer le mot de passe',
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'role': 'Rôle',
      'active': 'Actif',
      'inactive': 'Inactif',
      'lastLogin': 'Dernière connexion',
      'createdAt': 'Créé le',
      'updatedAt': 'Mis à jour le',
      'addUser': 'Ajouter un utilisateur',
      'editUser': 'Modifier l\'utilisateur',
      'deleteUser': 'Supprimer l\'utilisateur',
      'userDetails': 'Détails de l\'utilisateur',
      'userList': 'Liste des utilisateurs',
      'userProfile': 'Profil utilisateur',
      'viewProfile': 'Voir le profil',
      
      // Rôles
      'roles': 'Rôles',
      'roleName': 'Nom du rôle',
      'roleDescription': 'Description du rôle',
      'permissions': 'Permissions',
      'addRole': 'Ajouter un rôle',
      'editRole': 'Modifier le rôle',
      'deleteRole': 'Supprimer le rôle',
      'roleDetails': 'Détails du rôle',
      'roleList': 'Liste des rôles',
      
      // Authentification
      'forgotPassword': 'Mot de passe oublié',
      'resetPassword': 'Réinitialiser le mot de passe',
      'changePassword': 'Changer le mot de passe',
      'currentPassword': 'Mot de passe actuel',
      'newPassword': 'Nouveau mot de passe',
      'confirmNewPassword': 'Confirmer le nouveau mot de passe',
      'loginFailed': 'Échec de la connexion',
      'invalidCredentials': 'Identifiants invalides',
      'accountLocked': 'Compte verrouillé',
      'accountDisabled': 'Compte désactivé',
      'sessionExpired': 'Session expirée',
      'pleaseLogin': 'Veuillez vous connecter',
      'rememberMe': 'Se souvenir de moi',
      'twoFactorAuth': 'Authentification à deux facteurs',
      'verificationCode': 'Code de vérification'
    },
    en: {
      // General
      'welcome': 'Welcome',
      'login': 'Login',
      'logout': 'Logout',
      'profile': 'Profile',
      'loading': 'Loading...',
      'save': 'Save',
      'cancel': 'Cancel',
      'delete': 'Delete',
      'edit': 'Edit',
      'search': 'Search',
      'back': 'Back',
      'add': 'Add',
      'export': 'Export',
      'import': 'Import',
      'filter': 'Filter',
      'sort': 'Sort',
      'actions': 'Actions',
      'confirm': 'Confirm',
      'yes': 'Yes',
      'no': 'No',
      'success': 'Success',
      'error': 'Error',
      'warning': 'Warning',
      'info': 'Information',
      
      // Users
      'users': 'Users',
      'user': 'User',
      'username': 'Username',
      'email': 'Email',
      'password': 'Password',
      'confirmPassword': 'Confirm Password',
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'role': 'Role',
      'active': 'Active',
      'inactive': 'Inactive',
      'lastLogin': 'Last Login',
      'createdAt': 'Created At',
      'updatedAt': 'Updated At',
      'addUser': 'Add User',
      'editUser': 'Edit User',
      'deleteUser': 'Delete User',
      'userDetails': 'User Details',
      'userList': 'User List',
      'userProfile': 'User Profile',
      'viewProfile': 'View Profile',
      
      // Roles
      'roles': 'Roles',
      'roleName': 'Role Name',
      'roleDescription': 'Role Description',
      'permissions': 'Permissions',
      'addRole': 'Add Role',
      'editRole': 'Edit Role',
      'deleteRole': 'Delete Role',
      'roleDetails': 'Role Details',
      'roleList': 'Role List',
      
      // Authentication
      'forgotPassword': 'Forgot Password',
      'resetPassword': 'Reset Password',
      'changePassword': 'Change Password',
      'currentPassword': 'Current Password',
      'newPassword': 'New Password',
      'confirmNewPassword': 'Confirm New Password',
      'loginFailed': 'Login Failed',
      'invalidCredentials': 'Invalid Credentials',
      'accountLocked': 'Account Locked',
      'accountDisabled': 'Account Disabled',
      'sessionExpired': 'Session Expired',
      'pleaseLogin': 'Please Login',
      'rememberMe': 'Remember Me',
      'twoFactorAuth': 'Two-Factor Authentication',
      'verificationCode': 'Verification Code'
    }
  };

  constructor() { }

  setLanguage(lang: string): void {
    if (lang === 'fr' || lang === 'en') {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
    }
  }

  getCurrentLanguage(): string {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'fr' || savedLang === 'en') {
      this.currentLanguage = savedLang;
    }
    return this.currentLanguage;
  }

  translate(key: string): string {
    if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
      return this.translations[this.currentLanguage][key];
    }
    // Fallback to French if the key is not found in the current language
    if (this.translations['fr'] && this.translations['fr'][key]) {
      return this.translations['fr'][key];
    }
    // Return the key itself if not found in any language
    return key;
  }
}
