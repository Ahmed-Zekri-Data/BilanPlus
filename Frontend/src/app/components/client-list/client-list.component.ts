import { Component } from '@angular/core';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent {
  clients: { nom: string; email: string; telephone: string }[] = [];

  addClient(client: { nom: string; email: string; telephone: string }) {
    this.clients.push(client);
  }

  deleteClient(index: number) {
    this.clients.splice(index, 1);
  }
}
