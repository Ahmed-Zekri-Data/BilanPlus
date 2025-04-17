import { Component } from '@angular/core';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent {
  clients: { nom: string; email: string; telephone: string }[] = [];
  editingIndex: number | null = null;
  editedClient = { nom: '', email: '', telephone: '' };

  // **Nouveau** : terme de recherche
  searchTerm: string = '';

  constructor() {
    const storedClients = localStorage.getItem('clients');
    this.clients = storedClients ? JSON.parse(storedClients) : [];
  }

  deleteClient(index: number) {
    this.clients.splice(index, 1);
    localStorage.setItem('clients', JSON.stringify(this.clients));
  }

  editClient(index: number) {
    this.editingIndex = index;
    this.editedClient = { ...this.clients[index] };
  }

  updateClient() {
    if (this.editingIndex !== null) {
      this.clients[this.editingIndex] = { ...this.editedClient };
      localStorage.setItem('clients', JSON.stringify(this.clients));
      this.editingIndex = null;
    }
  }

  cancelEdit() {
    this.editingIndex = null;
  }

  // **Nouveau** : retourne la liste filtrée
  get filteredClients() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients.filter(c =>
      c.nom.toLowerCase().includes(term)
    );
  }
}
