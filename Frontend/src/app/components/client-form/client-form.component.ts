import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent {
  @Output() clientAdded = new EventEmitter<{ nom: string; email: string; telephone: string }>();

  clientForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    telephone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{8}$')])
  });

  message: string = '';

  onSubmit() {
    if (this.clientForm.valid) {
      const newClient = {
        nom: this.clientForm.value.nom as string,
        email: this.clientForm.value.email as string,
        telephone: this.clientForm.value.telephone as string
      };

      this.clientAdded.emit(newClient);
      this.message = "Client ajouté avec succès !";
      this.clientForm.reset();
    } else {
      this.message = "Veuillez remplir correctement le formulaire.";
    }
  }
}
