export interface Role {
  id?: string;
  _id?: string;
  nom: string;
  description?: string;
  actif: boolean;
  dateCreation?: Date;
  permissions?: string[];
}