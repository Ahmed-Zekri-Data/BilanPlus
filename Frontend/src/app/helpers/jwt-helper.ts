export class JwtHelper {
  /**
   * Décode un token JWT sans vérification de signature
   * @param token Le token JWT à décoder
   * @returns L'objet décodé ou null en cas d'erreur
   */
  decodeToken(token: string): any {
    try {
      // Vérifier que le token est au format JWT (xxx.yyy.zzz)
      if (!token || token.split('.').length !== 3) {
        console.error('JwtHelper: Format de token invalide');
        return null;
      }
      
      // Récupérer la partie payload (deuxième partie du token)
      const base64Url = token.split('.')[1];
      
      // Remplacer les caractères spéciaux pour la décodification base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Décoder le payload
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      // Parser le JSON
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JwtHelper: Erreur lors du décodage du token:', error);
      return null;
    }
  }
  
  /**
   * Vérifie si un token JWT est expiré
   * @param token Le token JWT à vérifier
   * @returns true si le token est expiré, false sinon
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        console.error('JwtHelper: Token sans date d\'expiration');
        return true;
      }
      
      // La date d'expiration est en secondes, la convertir en millisecondes
      const expirationDate = new Date(decoded.exp * 1000);
      const currentDate = new Date();
      
      return expirationDate < currentDate;
    } catch (error) {
      console.error('JwtHelper: Erreur lors de la vérification de l\'expiration du token:', error);
      return true;
    }
  }
}
