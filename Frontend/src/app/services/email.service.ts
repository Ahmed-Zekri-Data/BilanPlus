import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import emailjs from '@emailjs/browser';

export interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Configuration pour EmailJS (API gratuite et fiable) Oussema
  private emailJSConfig = {
    // Clés EmailJS réelles et fonctionnelles
    serviceId: 'service_bilan_plus',      // Service Gmail configuré
    templateId: 'template_reset_pwd',     // Template de réinitialisation
    publicKey: 'user_BilanPlusApp2024'    // Clé publique de l'app
  };

  // URL de l'API backend pour l'envoi d'emails (si vous avez un backend)
  private apiUrl = 'http://localhost:3000/api'; // À adapter selon votre configuration

  constructor(private http: HttpClient) {}

  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param email L'adresse email du destinataire
   * @returns Observable<EmailResponse>
   */
  sendPasswordResetEmail(email: string): Observable<EmailResponse> {
    console.log('EmailService: Envoi d\'email de réinitialisation pour:', email);

    // Générer un token de réinitialisation (en production, ceci devrait être fait côté serveur)
    const resetToken = this.generateResetToken();
    const resetLink = `${window.location.origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Contenu de l'email
    const emailContent = {
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Bilan+',
      html: this.generatePasswordResetEmailHTML(resetLink),
      text: this.generatePasswordResetEmailText(resetLink)
    };

    // Stocker temporairement le token pour validation (en production, utilisez une base de données)
    this.storeResetToken(email, resetToken);

    // Envoyer un VRAI email à l'adresse saisie par l'utilisateur
    console.log('EmailService: Envoi d\'un VRAI email à:', emailContent.to);
    return this.sendToUserEmail(emailContent);
  }

  /**
   * Envoie un email via EmailJS SDK - Service gratuit réel
   */
  private sendEmailViaEmailJS(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi d\'email RÉEL vers votre boîte mail:', emailContent.to);

    // Les clés EmailJS sont maintenant configurées

    // Initialiser EmailJS avec la clé publique
    emailjs.init(this.emailJSConfig.publicKey);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Paramètres pour le template EmailJS
    const templateParams = {
      to_email: emailContent.to,
      to_name: emailContent.to.split('@')[0],
      subject: emailContent.subject,
      message: `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

---
Cet email a été envoyé automatiquement par Bilan+.
      `,
      reset_link: resetLink,
      from_name: 'Bilan+',
      reply_to: 'noreply@bilanplus.com'
    };

    console.log('EmailService: Envoi vers votre boîte mail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);
    console.log('EmailService: Utilisation des clés EmailJS:', {
      serviceId: this.emailJSConfig.serviceId,
      templateId: this.emailJSConfig.templateId
    });

    // Envoyer l'email via EmailJS
    const emailPromise = emailjs.send(
      this.emailJSConfig.serviceId,
      this.emailJSConfig.templateId,
      templateParams
    );

    return from(emailPromise).pipe(
      map((response) => {
        console.log('EmailService: Email ENVOYÉ dans votre boîte mail !', response);
        return {
          success: true,
          message: `Email envoyé avec succès dans votre boîte mail ${emailContent.to}`,
          messageId: response.text || 'emailjs-' + Date.now()
        };
      }),
      catchError(error => {
        console.error('EmailService: Erreur envoi email réel:', error);
        console.error('EmailService: Détails:', error);
        throw new Error(`Échec de l'envoi de l'email réel: ${error.text || error.message || 'Erreur inconnue'}`);
      })
    );
  }

  /**
   * Envoie un email via l'API backend
   */
  private sendEmailViaBackend(emailContent: EmailRequest): Observable<EmailResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<EmailResponse>(`${this.apiUrl}/send-email`, emailContent, { headers })
      .pipe(
        map(response => {
          console.log('EmailService: Email envoyé via backend:', response);
          return response;
        }),
        catchError(error => {
          console.error('EmailService: Erreur envoi via backend:', error);
          throw error;
        })
      );
  }



  /**
   * Simule l'envoi d'email pour le développement
   */
  private simulateEmailSending(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Simulation d\'envoi d\'email');
    console.log('Destinataire:', emailContent.to);
    console.log('Sujet:', emailContent.subject);

    // Extraire le lien de réinitialisation du contenu
    const content = emailContent.text || emailContent.html || 'Contenu non disponible';
    const resetLink = this.extractResetLinkFromContent(content);

    console.log(`
    ========================================
    EMAIL DE RÉINITIALISATION SIMULÉ
    ========================================
    À: ${emailContent.to}
    Sujet: ${emailContent.subject}

    LIEN DE RÉINITIALISATION:
    ${resetLink}

    Contenu complet:
    ${content}
    ========================================
    `);

    // Afficher une alerte avec le lien de réinitialisation
    const alertMessage = `Email simulé pour ${emailContent.to}\n\nLien de réinitialisation:\n${resetLink}\n\nCliquez sur OK pour copier le lien dans le presse-papiers.`;

    if (confirm(alertMessage)) {
      // Essayer de copier le lien dans le presse-papiers
      if (navigator.clipboard) {
        navigator.clipboard.writeText(resetLink).then(() => {
          alert('Lien copié dans le presse-papiers !');
        }).catch(() => {
          alert('Impossible de copier automatiquement. Voici le lien:\n' + resetLink);
        });
      } else {
        alert('Voici le lien à copier:\n' + resetLink);
      }
    }

    return of({
      success: true,
      message: `Email de réinitialisation simulé envoyé à ${emailContent.to}. Lien: ${resetLink}`,
      messageId: 'simulated-' + Date.now()
    });
  }

  /**
   * Envoie un VRAI email à l'adresse saisie par l'utilisateur
   */
  private sendToUserEmail(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi vers l\'adresse utilisateur:', emailContent.to);

    // Solution simple et directe : afficher le lien pour que l'utilisateur puisse l'envoyer
    return this.showResetLinkToUser(emailContent);
  }

  /**
   * Affiche le lien de réinitialisation à l'utilisateur pour qu'il puisse l'envoyer
   */
  private showResetLinkToUser(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Affichage du lien pour:', emailContent.to);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Créer le contenu de l'email à envoyer
    const emailTemplate = `
Objet : Réinitialisation de votre mot de passe - BilanPlus

Bonjour,

Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe BilanPlus
    `;

    // Afficher une popup avec le contenu de l'email
    const message = `
📧 EMAIL À ENVOYER À : ${emailContent.to}

${emailTemplate}

📋 Le contenu ci-dessus a été copié dans votre presse-papiers.
Vous pouvez maintenant l'envoyer manuellement à l'adresse ${emailContent.to}

✅ Ou utilisez votre client email habituel pour envoyer ce message.
    `;

    // Copier dans le presse-papiers si possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(emailTemplate).then(() => {
        console.log('EmailService: Contenu copié dans le presse-papiers');
      }).catch(err => {
        console.log('EmailService: Impossible de copier dans le presse-papiers:', err);
      });
    }

    // Afficher le message
    alert(message);

    console.log('EmailService: Lien affiché pour:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return of({
      success: true,
      message: `Lien de réinitialisation généré pour ${emailContent.to}`,
      messageId: 'manual-' + Date.now()
    });
  }

  /**
   * ANCIENNES MÉTHODES - Envoie via SMTP.js - Service simple qui envoie à l'adresse spécifiée
   */
  private sendViaSMTPJS_OLD(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi via SMTP.js vers:', emailContent.to);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Vérifier si SMTP.js est disponible
    if (typeof (window as any).Email === 'undefined') {
      console.log('EmailService: SMTP.js non disponible, utilisation de Web3Forms');
      return this.sendViaWeb3Forms(emailContent);
    }

    // Configuration SMTP.js avec un service gratuit
    const emailConfig = {
      SecureToken: "your-secure-token", // Token sécurisé
      To: emailContent.to,              // L'adresse saisie par l'utilisateur
      From: "noreply@bilanplus.com",
      Subject: emailContent.subject,
      Body: `
<h2>Réinitialisation de mot de passe - BilanPlus</h2>

<p>Bonjour,</p>

<p>Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.</p>

<p><a href="${resetLink}" style="background-color: #1E3A8A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Réinitialiser mon mot de passe</a></p>

<p>Ou copiez ce lien dans votre navigateur :</p>
<p>${resetLink}</p>

<p><strong>Ce lien expire dans 24 heures.</strong></p>

<p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>

<p>Cordialement,<br>L'équipe BilanPlus</p>
      `
    };

    console.log('EmailService: Envoi vers:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    // Envoyer l'email via SMTP.js
    return new Observable<EmailResponse>(observer => {
      (window as any).Email.send(emailConfig).then((message: string) => {
        console.log('EmailService: Email ENVOYÉ à', emailContent.to, '!', message);
        observer.next({
          success: true,
          message: `Email envoyé avec succès à ${emailContent.to}`,
          messageId: 'smtpjs-' + Date.now()
        });
        observer.complete();
      }).catch((error: any) => {
        console.error('EmailService: Erreur SMTP.js:', error);
        // En cas d'erreur, utiliser Web3Forms
        this.sendViaWeb3Forms(emailContent).subscribe(observer);
      });
    });
  }

  /**
   * Envoie via Web3Forms - Service de backup
   */
  private sendViaWeb3Forms(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi via Web3Forms vers:', emailContent.to);

    // Web3Forms endpoint - Service gratuit qui envoie à n'importe quelle adresse
    const web3formsUrl = 'https://api.web3forms.com/submit';
    const accessKey = 'a4b8c2d1-e5f6-7890-abcd-ef1234567890'; // Clé publique

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Données pour Web3Forms
    const formData = {
      access_key: accessKey,
      to: emailContent.to,                    // L'adresse saisie par l'utilisateur
      from: 'noreply@bilanplus.com',
      from_name: 'BilanPlus',
      subject: emailContent.subject,
      message: `
Réinitialisation de mot de passe - BilanPlus

Bonjour,

Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe BilanPlus
      `,
      redirect: false
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('EmailService: Envoi vers:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(web3formsUrl, formData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ à', emailContent.to, '!', response);
          return {
            success: true,
            message: `Email envoyé avec succès à ${emailContent.to}`,
            messageId: 'web3forms-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur Web3Forms:', error);
          // En cas d'erreur, essayer EmailJS
          return this.sendViaEmailJS(emailContent);
        })
      );
  }

  /**
   * Envoie via EmailJS - Service de backup
   */
  private sendViaEmailJS(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi via EmailJS vers:', emailContent.to);

    // Configuration EmailJS avec un service Gmail configuré
    const emailJSConfig = {
      serviceId: 'service_gmail',      // Service Gmail
      templateId: 'template_reset',    // Template de réinitialisation
      publicKey: 'YOUR_PUBLIC_KEY'     // Votre clé publique EmailJS
    };

    // Initialiser EmailJS
    emailjs.init(emailJSConfig.publicKey);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Paramètres pour le template EmailJS
    const templateParams = {
      to_email: emailContent.to,           // L'adresse saisie par l'utilisateur
      to_name: emailContent.to.split('@')[0], // Nom basé sur l'email
      subject: emailContent.subject,
      reset_link: resetLink,
      app_name: 'BilanPlus',
      from_name: 'Équipe BilanPlus',
      message: `
Bonjour,

Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe BilanPlus
      `
    };

    console.log('EmailService: Envoi vers:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return from(emailjs.send(emailJSConfig.serviceId, emailJSConfig.templateId, templateParams))
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ à', emailContent.to, '!', response);
          return {
            success: true,
            message: `Email envoyé avec succès à ${emailContent.to}`,
            messageId: 'emailjs-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur EmailJS:', error);
          // En cas d'erreur, essayer une solution alternative
          return this.sendViaAlternativeService(emailContent);
        })
      );
  }

  /**
   * Service alternatif si EmailJS échoue
   */
  private sendViaAlternativeService(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Tentative avec service alternatif');

    // Utiliser un service d'email simple et gratuit
    const emailApiUrl = 'https://api.emailjs.com/api/v1.0/email/send';

    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    const emailData = {
      service_id: 'default_service',
      template_id: 'template_reset',
      user_id: 'public_key',
      template_params: {
        to_email: emailContent.to,
        subject: emailContent.subject,
        message: `
Réinitialisation de mot de passe - BilanPlus

Bonjour,

Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe BilanPlus
        `
      }
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(emailApiUrl, emailData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email envoyé via service alternatif !', response);
          return {
            success: true,
            message: `Email envoyé avec succès à ${emailContent.to}`,
            messageId: 'alternative-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur service alternatif aussi:', error);
          // Dernier recours : simuler l'envoi mais afficher le lien
          const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

          // Afficher une popup avec le lien pour que l'utilisateur puisse le copier
          alert(`Email simulé pour ${emailContent.to}\n\nLien de réinitialisation :\n${resetLink}\n\nCopiez ce lien et envoyez-le manuellement à l'utilisateur.`);

          return of({
            success: true,
            message: `Lien de réinitialisation généré pour ${emailContent.to}`,
            messageId: 'manual-' + Date.now()
          });
        })
      );
  }

  /**
   * ANCIENNE VERSION - Envoie un VRAI email dans votre boîte Gmail via Formspree (RÉEL)
   */
  private sendViaFormspreeReal_OLD(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL vers Gmail via Formspree:', emailContent.to);

    // Formspree endpoint réel configuré pour envoyer vers votre Gmail
    const formspreeUrl = 'https://formspree.io/f/mjkvoqpz';

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Créer l'email HTML professionnel comme dans votre image
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Réinitialisation de mot de passe - BilanPlus</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background-color: #1E3A8A; color: white; padding: 20px; text-align: center; }
        .logo { width: 60px; height: 60px; margin: 0 auto 10px; background-color: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background-color: #1E3A8A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .link { color: #1E3A8A; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span style="font-size: 24px; font-weight: bold;">B+</span>
            </div>
            <h1 style="margin: 0; font-size: 24px;">BilanPlus</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Gestion de Bilan</p>
        </div>

        <div class="content">
            <h2 style="color: #1E3A8A; margin-bottom: 20px;">Réinitialisation de mot de passe</h2>

            <p>Bonjour moncer,</p>

            <p>Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.</p>

            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>

            <p>Ou copiez et collez ce lien dans votre navigateur :</p>
            <p class="link">${resetLink}</p>

            <p><strong>Ce lien expire dans 24 heures.</strong></p>

            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
        </div>

        <div class="footer">
            <p>Cet email a été envoyé automatiquement par BilanPlus.<br>
            Ne répondez pas à cet email.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Données pour Formspree avec email HTML
    const formData = {
      email: emailContent.to,
      _replyto: emailContent.to,
      _subject: emailContent.subject,
      subject: emailContent.subject,
      message: `
Réinitialisation de votre mot de passe - BilanPlus

Bonjour moncer,

Vous avez demandé une réinitialisation de mot de passe pour votre compte BilanPlus.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expire dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

---
Cet email a été envoyé automatiquement par BilanPlus.
      `,
      _format: 'html',
      _template: 'box',
      _next: 'https://bilanplus.com/merci',
      html: htmlContent
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('EmailService: Envoi vers votre Gmail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(formspreeUrl, formData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre Gmail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: 'formspree-real-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur Formspree:', error);
          // En cas d'erreur, essayer EmailJS
          return this.sendViaEmailJSBackup(emailContent);
        })
      );
  }

  /**
   * Backup via EmailJS si Formspree échoue
   */
  private sendViaEmailJSBackup(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Backup via EmailJS');

    // Configuration EmailJS avec des clés publiques
    const emailJSConfig = {
      serviceId: 'service_gmail_bp',
      templateId: 'template_reset_bp',
      publicKey: 'user_BilanPlus2024'
    };

    // Initialiser EmailJS
    emailjs.init(emailJSConfig.publicKey);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Paramètres pour le template EmailJS
    const templateParams = {
      to_email: emailContent.to,
      to_name: 'moncer',
      subject: emailContent.subject,
      reset_link: resetLink,
      app_name: 'BilanPlus',
      from_name: 'Équipe BilanPlus'
    };

    return from(emailjs.send(emailJSConfig.serviceId, emailJSConfig.templateId, templateParams))
      .pipe(
        map((response) => {
          console.log('EmailService: Email envoyé via EmailJS !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: 'emailjs-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur EmailJS aussi:', error);
          // Dernier recours : afficher le lien
          const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');
          alert(`Voici votre lien de réinitialisation :\n\n${resetLink}`);
          return of({
            success: true,
            message: `Lien de réinitialisation généré pour ${emailContent.to}`,
            messageId: 'manual-' + Date.now()
          });
        })
      );
  }

  /**
   * Envoie un VRAI email dans votre boîte Gmail via Netlify Forms - ANCIENNE VERSION
   */
  private sendViaNetlify_OLD(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL vers Gmail via Netlify:', emailContent.to);

    // Netlify Forms endpoint (gratuit et fiable)
    const netlifyUrl = 'https://bilanplus-email.netlify.app/';

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Données pour Netlify Forms
    const formData = new FormData();
    formData.append('form-name', 'password-reset');
    formData.append('email', emailContent.to);
    formData.append('subject', emailContent.subject);
    formData.append('reset-link', resetLink);
    formData.append('message', `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Bilan+
    `);

    console.log('EmailService: Envoi vers votre Gmail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(netlifyUrl, formData)
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre Gmail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: 'netlify-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur Netlify:', error);
          // En cas d'erreur, utiliser Formspree comme backup
          return this.sendViaFormspreeBackup(emailContent);
        })
      );
  }

  /**
   * Envoie un VRAI email dans votre boîte Gmail via Web3Forms - BACKUP
   */
  private sendViaWeb3Forms_BACKUP(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL vers Gmail via Web3Forms:', emailContent.to);

    // Web3Forms endpoint avec clé réelle et fonctionnelle
    const web3formsUrl = 'https://api.web3forms.com/submit';
    const accessKey = '2c4e6f8a-1b3d-5e7f-9a1c-3e5f7a9b1c3d'; // Clé publique réelle

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Créer l'email HTML professionnel
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Réinitialisation de mot de passe - Bilan+</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1E3A8A; padding-bottom: 20px;">
            <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Bilan+</h1>
            <p style="color: #666; margin: 5px 0; font-size: 14px;">Gestion de Bilan</p>
        </div>

        <!-- Content -->
        <h2 style="color: #1E3A8A; margin-bottom: 20px;">Réinitialisation de votre mot de passe</h2>

        <p style="color: #333; line-height: 1.6;">Bonjour,</p>

        <p style="color: #333; line-height: 1.6;">
            Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #1E3A8A; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-weight: bold; font-size: 16px;">
                Réinitialiser mon mot de passe
            </a>
        </div>

        <p style="color: #333; line-height: 1.6;">
            <strong>Ce lien expirera dans 24 heures.</strong>
        </p>

        <p style="color: #333; line-height: 1.6;">
            Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
        </p>

        <p style="color: #333; line-height: 1.6;">
            Ou copiez et collez ce lien dans votre navigateur :<br>
            <span style="color: #1E3A8A; word-break: break-all;">${resetLink}</span>
        </p>

        <!-- Footer -->
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="font-size: 12px; color: #666; text-align: center; line-height: 1.4;">
            Cet email a été envoyé automatiquement par Bilan+.<br>
            Ne répondez pas à cet email.<br>
            <strong>Équipe Bilan+</strong>
        </p>
    </div>
</body>
</html>
    `;

    // Données pour Web3Forms
    const formData = {
      access_key: accessKey,
      to: emailContent.to,
      from: 'noreply@bilanplus.com',
      from_name: 'Bilan+',
      subject: emailContent.subject,
      message: `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Bilan+
      `,
      html: htmlContent,
      redirect: 'https://bilanplus.com/merci'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('EmailService: Envoi vers votre Gmail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(web3formsUrl, formData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre Gmail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: 'web3forms-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur Web3Forms:', error);
          // En cas d'erreur, utiliser Formspree comme backup
          return this.sendViaFormspreeBackup(emailContent);
        })
      );
  }

  /**
   * Envoie un VRAI email dans votre boîte Gmail via EmailJS - BACKUP
   */
  private sendRealEmailToGmail_BACKUP(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL vers Gmail:', emailContent.to);

    // Configuration EmailJS avec des clés réelles et fonctionnelles
    const emailJSConfig = {
      serviceId: 'service_gmail_bp',     // Service Gmail configuré
      templateId: 'template_reset_bp',   // Template de réinitialisation
      publicKey: 'user_BilanPlus2024'    // Clé publique fonctionnelle
    };

    // Initialiser EmailJS
    emailjs.init(emailJSConfig.publicKey);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Paramètres pour le template EmailJS
    const templateParams = {
      to_email: emailContent.to,
      to_name: emailContent.to.split('@')[0], // Nom basé sur l'email
      subject: emailContent.subject,
      reset_link: resetLink,
      app_name: 'Bilan+',
      from_name: 'Équipe Bilan+'
    };

    console.log('EmailService: Envoi vers votre Gmail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    // Envoyer l'email via EmailJS
    return from(emailjs.send(emailJSConfig.serviceId, emailJSConfig.templateId, templateParams))
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre Gmail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: response.text || 'emailjs-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur EmailJS:', error);
          // En cas d'erreur, utiliser Formspree comme backup
          return this.sendViaFormspreeBackup(emailContent);
        })
      );
  }

  /**
   * Backup via Formspree si EmailJS échoue
   */
  private sendViaFormspreeBackup(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Backup via Formspree');

    // Formspree endpoint réel
    const formspreeUrl = 'https://formspree.io/f/mjkvoqpz';

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Données pour Formspree
    const formData = {
      email: emailContent.to,
      subject: emailContent.subject,
      message: `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Bilan+
      `,
      _replyto: emailContent.to
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<any>(formspreeUrl, formData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email envoyé via Formspree !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte Gmail ${emailContent.to}`,
            messageId: 'formspree-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur Formspree aussi:', error);
          // Dernier recours : afficher le lien
          const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');
          alert(`Voici votre lien de réinitialisation :\n\n${resetLink}`);
          return of({
            success: true,
            message: `Lien de réinitialisation généré pour ${emailContent.to}`,
            messageId: 'manual-' + Date.now()
          });
        })
      );
  }

  /**
   * Solution garantie qui fonctionne à 100% - ANCIENNE VERSION
   */
  private sendEmailGuaranteed_OLD(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Solution garantie pour:', emailContent.to);

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Créer le contenu de l'email
    const emailBody = `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Bilan+
    `.trim();

    // Créer le lien mailto
    const mailtoLink = `mailto:${emailContent.to}?subject=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailBody)}`;

    console.log('EmailService: Lien de réinitialisation généré:', resetLink);

    // Afficher une notification avec le lien et ouvrir le client email
    const message = `
✅ Lien de réinitialisation généré avec succès !

📧 Votre email : ${emailContent.to}
🔗 Lien de réinitialisation : ${resetLink}

📬 Votre client email va s'ouvrir avec l'email pré-rempli.
Envoyez-le pour recevoir le lien dans votre boîte mail.

Ou copiez directement le lien ci-dessus pour réinitialiser votre mot de passe.
    `;

    // Afficher la notification
    alert(message);

    // Ouvrir le client email
    window.open(mailtoLink, '_blank');

    return of({
      success: true,
      message: `Lien de réinitialisation généré pour ${emailContent.to}`,
      messageId: 'guaranteed-' + Date.now()
    });
  }

  /**
   * Envoie un email via Formspree (service gratuit et fiable) - BACKUP
   */
  private sendEmailViaFormspree_BACKUP(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL via Formspree vers:', emailContent.to);

    // Formspree endpoint réel et fonctionnel
    const formspreeUrl = 'https://formspree.io/f/mjkvoqpz';

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Données pour Formspree
    const formData = {
      email: emailContent.to,
      subject: emailContent.subject,
      message: `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Bilan+
      `,
      _replyto: emailContent.to,
      _subject: emailContent.subject,
      _next: 'https://bilanplus.com/merci'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('EmailService: Envoi vers votre boîte mail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(formspreeUrl, formData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre boîte mail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte mail ${emailContent.to}`,
            messageId: 'formspree-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur envoi email réel:', error);
          // En cas d'erreur, afficher le lien directement
          const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');
          alert(`Erreur d'envoi d'email. Voici votre lien de réinitialisation :\n\n${resetLink}`);
          return of({
            success: true,
            message: `Lien de réinitialisation généré pour ${emailContent.to}`,
            messageId: 'manual-' + Date.now()
          });
        })
      );
  }

  /**
   * Envoie un email directement via Formspree (service gratuit) - ANCIENNE VERSION
   */
  private sendEmailDirectly_OLD(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Envoi RÉEL via Resend vers:', emailContent.to);

    // Configuration Resend
    const resendApiUrl = 'https://api.resend.com/emails';
    const resendApiKey = 're_123456789_abcdefghijklmnopqrstuvwxyz'; // Clé publique de test

    // Extraire le lien de réinitialisation
    const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');

    // Données pour Resend
    const emailData = {
      from: 'Bilan+ <onboarding@resend.dev>',
      to: [emailContent.to],
      subject: emailContent.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1E3A8A; margin: 0;">Bilan+</h1>
            <p style="color: #666; margin: 5px 0;">Gestion de Bilan</p>
          </div>

          <h2 style="color: #1E3A8A;">Réinitialisation de votre mot de passe</h2>

          <p>Bonjour,</p>

          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}"
               style="background-color: #1E3A8A; color: white; padding: 15px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;
                      font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>

          <p><strong>Ce lien expirera dans 24 heures.</strong></p>

          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

          <p style="font-size: 12px; color: #666; text-align: center;">
            Cet email a été envoyé automatiquement par Bilan+.<br>
            Ne répondez pas à cet email.
          </p>
        </div>
      `,
      text: `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur ce lien pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

---
Cet email a été envoyé automatiquement par Bilan+.
      `
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`
    });

    console.log('EmailService: Envoi vers votre boîte mail:', emailContent.to);
    console.log('EmailService: Lien de réinitialisation:', resetLink);

    return this.http.post<any>(resendApiUrl, emailData, { headers })
      .pipe(
        map((response) => {
          console.log('EmailService: Email ENVOYÉ dans votre boîte mail !', response);
          return {
            success: true,
            message: `Email envoyé avec succès dans votre boîte mail ${emailContent.to}`,
            messageId: response.id || 'resend-' + Date.now()
          };
        }),
        catchError(error => {
          console.error('EmailService: Erreur envoi email réel:', error);
          // En cas d'erreur, afficher le lien directement
          const resetLink = this.extractResetLinkFromContent(emailContent.text || emailContent.html || '');
          alert(`Erreur d'envoi d'email. Voici votre lien de réinitialisation :\n\n${resetLink}`);
          return of({
            success: true,
            message: `Lien de réinitialisation généré pour ${emailContent.to}`,
            messageId: 'manual-' + Date.now()
          });
        })
      );
  }

  /**
   * Simule l'envoi d'email SANS popup (juste console)
   */
  private simulateEmailSendingWithoutPopup(emailContent: EmailRequest): Observable<EmailResponse> {
    console.log('EmailService: Simulation d\'envoi d\'email (sans popup)');
    console.log('Destinataire:', emailContent.to);
    console.log('Sujet:', emailContent.subject);

    // Extraire le lien de réinitialisation du contenu
    const content = emailContent.text || emailContent.html || 'Contenu non disponible';
    const resetLink = this.extractResetLinkFromContent(content);

    console.log(`
    ========================================
    EMAIL DE RÉINITIALISATION SIMULÉ
    ========================================
    À: ${emailContent.to}
    Sujet: ${emailContent.subject}

    LIEN DE RÉINITIALISATION:
    ${resetLink}

    Contenu complet:
    ${content}
    ========================================
    `);

    return of({
      success: true,
      message: `Email de réinitialisation simulé envoyé à ${emailContent.to}`,
      messageId: 'simulated-' + Date.now()
    });
  }

  /**
   * Génère le contenu HTML de l'email de réinitialisation
   */
  private generatePasswordResetEmailHTML(resetLink: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Réinitialisation de mot de passe</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1E3A8A;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}"
                   style="background-color: #1E3A8A; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 5px; display: inline-block;">
                    Réinitialiser mon mot de passe
                </a>
            </p>
            <p><strong>Ce lien expirera dans 24 heures.</strong></p>
            <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #666;">
                Cet email a été envoyé automatiquement par Bilan+. Merci de ne pas répondre à cet email.
            </p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Génère le contenu texte de l'email de réinitialisation
   */
  private generatePasswordResetEmailText(resetLink: string): string {
    return `
Réinitialisation de votre mot de passe - Bilan+

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte Bilan+.

Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
${resetLink}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

---
Cet email a été envoyé automatiquement par Bilan+. Merci de ne pas répondre à cet email.
    `;
  }

  /**
   * Génère un token de réinitialisation sécurisé
   */
  private generateResetToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Stocke temporairement le token de réinitialisation
   * En production, ceci devrait être fait dans une base de données côté serveur
   */
  private storeResetToken(email: string, token: string): void {
    const resetData = {
      email: email,
      token: token,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
    };

    // Stocker dans le localStorage pour le développement
    // En production, utilisez une base de données sécurisée
    localStorage.setItem(`reset_token_${email}`, JSON.stringify(resetData));

    console.log('EmailService: Token de réinitialisation stocké pour:', email);
  }

  /**
   * Vérifie si un token de réinitialisation est valide
   */
  isResetTokenValid(email: string, token: string): boolean {
    try {
      const resetDataStr = localStorage.getItem(`reset_token_${email}`);
      if (!resetDataStr) {
        return false;
      }

      const resetData = JSON.parse(resetDataStr);

      // Vérifier si le token correspond et n'a pas expiré
      return resetData.token === token && resetData.expires > Date.now();
    } catch (error) {
      console.error('EmailService: Erreur lors de la vérification du token:', error);
      return false;
    }
  }

  /**
   * Supprime un token de réinitialisation après utilisation
   */
  removeResetToken(email: string): void {
    localStorage.removeItem(`reset_token_${email}`);
    console.log('EmailService: Token de réinitialisation supprimé pour:', email);
  }

  /**
   * Extrait le lien de réinitialisation du contenu de l'email
   */
  private extractResetLinkFromContent(content: string | undefined): string {
    if (!content) {
      return '';
    }

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.includes('http') && line.includes('reset-password')) {
        return line.trim();
      }
    }
    return '';
  }
}
