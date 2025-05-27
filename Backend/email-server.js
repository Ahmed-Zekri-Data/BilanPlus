const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration Gmail (vous devrez remplacer par vos vraies informations)
const emailConfig = {
  service: 'gmail',
  auth: {
    user: 'votre.email@gmail.com', // Remplacez par votre email Gmail
    pass: 'votre-mot-de-passe-app'  // Mot de passe d'application Gmail
  }
};

// Créer le transporteur
const transporter = nodemailer.createTransporter(emailConfig);

// Route pour envoyer l'email de réinitialisation
app.post('/api/send-reset-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    console.log('Envoi d\'email vers:', to);

    const mailOptions = {
      from: '"Bilan+" <noreply@bilanplus.com>',
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email envoyé avec succès:', result.messageId);
    
    res.json({
      success: true,
      message: `Email envoyé avec succès à ${to}`,
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
      error: error.message
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Serveur email fonctionnel!' });
});

app.listen(PORT, () => {
  console.log(`Serveur email démarré sur http://localhost:${PORT}`);
  console.log('Prêt à envoyer des emails!');
});
