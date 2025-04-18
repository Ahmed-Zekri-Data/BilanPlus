import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-relance-automation',
  templateUrl: './relance-automation.component.html',
  styleUrls: ['./relance-automation.component.css']
})
export class RelanceAutomationComponent implements OnInit {
  relanceForm: FormGroup;
  factures: any[] = [];
  clients: any[] = [];
  relances: any[] = [];
  upcomingReminders: any[] = [];
  relanceHistory: any[] = [];
  previewVisible: boolean = false;
  lastExecution: Date | null = null;

  constructor() {
    this.relanceForm = new FormGroup({
      avantEcheance: new FormControl(3, [Validators.required, Validators.min(1), Validators.max(30)]),
      premierRappel: new FormControl(3, [Validators.required, Validators.min(1), Validators.max(30)]),
      deuxiemeRappel: new FormControl(7, [Validators.required, Validators.min(1), Validators.max(30)]),
      derniereRelance: new FormControl(7, [Validators.required, Validators.min(1), Validators.max(30)]),
      emailActif: new FormControl(true),
      smsActif: new FormControl(false),
      appelActif: new FormControl(false),
      emailTemplate: new FormControl(
        'Cher {CLIENT},\n\nNous vous rappelons que la facture {FACTURE} d\'un montant de {MONTANT} arrive à échéance le {ECHEANCE}.\n\nMerci de bien vouloir procéder au règlement.\n\nCordialement,\nService Comptabilité', 
        [Validators.required]
      )
    });
  }

  ngOnInit(): void {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem('relanceSettings');
    if (savedSettings) {
      this.relanceForm.setValue(JSON.parse(savedSettings));
    }

    // Charger les factures
    const storedFactures = localStorage.getItem('factures');
    if (storedFactures) {
      this.factures = JSON.parse(storedFactures);
    }

    // Charger les clients
    const storedClients = localStorage.getItem('clients');
    if (storedClients) {
      this.clients = JSON.parse(storedClients);
    }

    // Charger les relances
    const storedRelances = localStorage.getItem('relances');
    if (storedRelances) {
      this.relances = JSON.parse(storedRelances);
      this.relanceHistory = [...this.relances].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ).slice(0, 10); // 10 dernières relances
    }

    // Charger la dernière exécution
    const lastExec = localStorage.getItem('lastRelanceExecution');
    if (lastExec) {
      this.lastExecution = new Date(lastExec);
    }

    // Générer l'aperçu des prochaines relances
    this.generateUpcomingReminders();
  }

  saveSettings(): void {
    if (this.relanceForm.valid) {
      localStorage.setItem('relanceSettings', JSON.stringify(this.relanceForm.value));
      alert('Paramètres de relance enregistrés avec succès');
      
      // Regénérer l'aperçu avec les nouveaux paramètres
      this.generateUpcomingReminders();
    }
  }

  showPreview(): void {
    this.previewVisible = !this.previewVisible;
  }

  generateUpcomingReminders(): void {
    const settings = this.relanceForm.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.upcomingReminders = [];

    // Parcourir toutes les factures non payées
    this.factures.forEach(facture => {
      if (facture.statut === 'Payée') return;
      
      const client = this.clients.find(c => c._id === facture.client || c.nom === facture.client);
      if (!client) return;
      
      const echeance = new Date(facture.echeance);
      echeance.setHours(0, 0, 0, 0);
      
      // Rappel avant échéance
      const avantEcheance = new Date(echeance);
      avantEcheance.setDate(avantEcheance.getDate() - settings.avantEcheance);
      
      if (avantEcheance >= today && avantEcheance <= this.getDatePlusDays(today, 7)) {
        // Si la date d'envoi est dans les 7 prochains jours
        this.upcomingReminders.push({
          date: avantEcheance,
          factureRef: facture.reference,
          client: client.nom,
          type: 'Rappel avant échéance',
          moyen: settings.emailActif ? 'Email' : (settings.smsActif ? 'SMS' : 'Appel')
        });
      }
      
      // Si la facture est déjà en retard, vérifier les rappels
      if (facture.statut === 'En retard') {
        const factureRelances = this.relances.filter(r => r.factureRef === facture.reference);
        
        // Premier rappel
        if (factureRelances.length === 0) {
          const premierRappelDate = new Date(echeance);
          premierRappelDate.setDate(premierRappelDate.getDate() + settings.premierRappel);
          
          if (premierRappelDate <= today) {
            // Si la date du premier rappel est déjà passée et qu'aucun rappel n'a été envoyé
            this.upcomingReminders.push({
              date: new Date(), // Aujourd'hui
              factureRef: facture.reference,
              client: client.nom,
              type: '1ère Relance',
              moyen: settings.emailActif ? 'Email' : (settings.smsActif ? 'SMS' : 'Appel')
            });
          } else if (premierRappelDate <= this.getDatePlusDays(today, 7)) {
            // Si la date du premier rappel est dans les 7 prochains jours
            this.upcomingReminders.push({
              date: premierRappelDate,
              factureRef: facture.reference,
              client: client.nom,
              type: '1ère Relance',
              moyen: settings.emailActif ? 'Email' : (settings.smsActif ? 'SMS' : 'Appel')
            });
          }
        }
        // Deuxième rappel
        else if (factureRelances.length === 1) {
          const dernierRappel = new Date(factureRelances[0].date);
          const deuxiemeRappelDate = new Date(dernierRappel);
          deuxiemeRappelDate.setDate(deuxiemeRappelDate.getDate() + settings.deuxiemeRappel);
          
          if (deuxiemeRappelDate <= today) {
            this.upcomingReminders.push({
              date: new Date(),
              factureRef: facture.reference,
              client: client.nom,
              type: '2ème Relance',
              moyen: settings.emailActif ? 'Email' : (settings.smsActif ? 'SMS' : 'Appel')
            });
          } else if (deuxiemeRappelDate <= this.getDatePlusDays(today, 7)) {
            this.upcomingReminders.push({
              date: deuxiemeRappelDate,
              factureRef: facture.reference,
              client: client.nom,
              type: '2ème Relance',
              moyen: settings.emailActif ? 'Email' : (settings.smsActif ? 'SMS' : 'Appel')
            });
          }
        }
        // Dernière relance
        else if (factureRelances.length === 2) {
          const dernierRappel = new Date(factureRelances[1].date);
          const derniereRelanceDate = new Date(dernierRappel);
          derniereRelanceDate.setDate(derniereRelanceDate.getDate() + settings.derniereRelance);
          
          if (derniereRelanceDate <= today) {
            this.upcomingReminders.push({
              date: new Date(),
              factureRef: facture.reference,
              client: client.nom,
              type: 'Mise en Demeure',
              moyen: 'Email et Courrier Recommandé'
            });
          } else if (derniereRelanceDate <= this.getDatePlusDays(today, 7)) {
            this.upcomingReminders.push({
              date: derniereRelanceDate,
              factureRef: facture.reference,
              client: client.nom,
              type: 'Mise en Demeure',
              moyen: 'Email et Courrier Recommandé'
            });
          }
        }
      }
    });
    
    // Trier par date
    this.upcomingReminders.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getDatePlusDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  executeReminders(): void {
    const today = new Date();
    const newRelances: any[] = [];
    
    // Filtrer seulement les rappels prévus pour aujourd'hui ou avant
    const remindersToExecute = this.upcomingReminders.filter(reminder => {
      const reminderDate = new Date(reminder.date);
      reminderDate.setHours(0, 0, 0, 0);
      const todayCopy = new Date(today);
      todayCopy.setHours(0, 0, 0, 0);
      return reminderDate <= todayCopy;
    });
    
    if (remindersToExecute.length === 0) {
      alert('Aucune relance à exécuter aujourd\'hui');
      return;
    }
    
    remindersToExecute.forEach(reminder => {
      // Trouver la facture correspondante
      const facture = this.factures.find(f => f.reference === reminder.factureRef);
      if (!facture) return;
      
      // Trouver le client correspondant
      const client = this.clients.find(c => c._id === facture.client || c.nom === facture.client);
      if (!client) return;
      
      // Créer la nouvelle relance
      const newRelance = {
        factureRef: reminder.factureRef,
        factureId: facture._id,
        client: client.nom,
        email: client.email,
        type: reminder.type,
        moyen: reminder.moyen,
        date: today,
        statut: 'Envoyée',
        message: this.generateMessageFromTemplate(
          this.relanceForm.get('emailTemplate')?.value,
          client.nom,
          facture.montantTTC,
          facture.reference,
          new Date(facture.echeance).toLocaleDateString()
        )
      };
      
      newRelances.push(newRelance);
    });
    
    // Ajouter les nouvelles relances
    this.relances = [...this.relances, ...newRelances];
    localStorage.setItem('relances', JSON.stringify(this.relances));
    
    // Mettre à jour l'historique des relances
    this.relanceHistory = [...newRelances, ...this.relanceHistory].slice(0, 10);
    
    // Mettre à jour la date de dernière exécution
    this.lastExecution = today;
    localStorage.setItem('lastRelanceExecution', today.toISOString());
    
    // Regénérer l'aperçu des prochaines relances
    this.generateUpcomingReminders();
    
    alert(`${newRelances.length} relances ont été envoyées avec succès !`);
  }

  generateMessageFromTemplate(template: string, client: string, montant: number, facture: string, echeance: string): string {
    return template
      .replace(/{CLIENT}/g, client)
      .replace(/{MONTANT}/g, montant.toFixed(2) + ' €')
      .replace(/{FACTURE}/g, facture)
      .replace(/{ECHEANCE}/g, echeance);
  }
}
