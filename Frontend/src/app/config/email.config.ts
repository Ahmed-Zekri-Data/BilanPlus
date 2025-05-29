// Configuration EmailJS
// Remplacez ces valeurs par vos vraies clés EmailJS

export const EMAIL_CONFIG = {
  // Vos clés EmailJS - À REMPLACER
  emailJS: {
    serviceId: 'service_xxxxxxx',    // Votre Service ID EmailJS
    templateId: 'template_xxxxxxx',  // Votre Template ID EmailJS
    publicKey: 'xxxxxxxxxxxxxxx'    // Votre Public Key EmailJS
  },
  
  // Configuration du template EmailJS
  // Assurez-vous que votre template EmailJS contient ces variables :
  templateVariables: {
    to_email: '{{to_email}}',           // Email du destinataire
    to_name: '{{to_name}}',             // Nom du destinataire
    subject: '{{subject}}',             // Sujet de l'email
    message: '{{message}}',             // Message complet
    reset_link: '{{reset_link}}',       // Lien de réinitialisation
    from_name: '{{from_name}}',         // Nom de l'expéditeur
    reply_to: '{{reply_to}}'            // Email de réponse
  }
};

// Instructions pour configurer EmailJS :
/*
1. Allez sur https://www.emailjs.com/
2. Créez un compte gratuit
3. Configurez un service email (Gmail, Outlook, etc.)
4. Créez un template avec le contenu suivant :

SUJET :
Réinitialisation de votre mot de passe - {{from_name}}

CONTENU :
Bonjour {{to_name}},

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte {{from_name}}.

Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
{{reset_link}}

Ce lien expirera dans 24 heures.

Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.

Cordialement,
L'équipe {{from_name}}

5. Remplacez les valeurs dans ce fichier par vos vraies clés
6. Testez l'envoi d'email
*/
