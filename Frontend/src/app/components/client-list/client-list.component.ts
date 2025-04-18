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
  searchTerm: string = '';

  constructor() {
    const stored = localStorage.getItem('clients');
    this.clients = stored ? JSON.parse(stored) : [];
  }

  get filteredClients() {
    const term = this.searchTerm.trim().toLowerCase();
    return term
      ? this.clients.filter(c => c.nom.toLowerCase().includes(term))
      : this.clients;
  }

  deleteClient(i: number) {
    this.clients.splice(i, 1);
    localStorage.setItem('clients', JSON.stringify(this.clients));
  }

  editClient(i: number) {
    this.editingIndex = i;
    this.editedClient = { ...this.clients[i] };
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
}
