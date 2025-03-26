import { Component } from '@angular/core';
import { UtilisateurService } from '../../services/utilisateur.service';
import { Utilisateur } from '../../Models/Utilisateur';


@Component({
  selector: 'app-utilisateur',
  templateUrl: './utilisateur.component.html',
  styleUrls: ['./utilisateur.component.css']
})
export class UtilisateurComponent {

  constructor(private UserService: UtilisateurService){}

  User:Utilisateur[]=[]

  ngOnInit(){
    this.UserService.getAllUsers().subscribe(
      (data) => this.User = data
    );
  }

  deleteUser(id: string) {
    this.UserService.deleteUser(id).subscribe(() => {
      this.User = this.User.filter(User => User._id !== id);
    });
}
}
