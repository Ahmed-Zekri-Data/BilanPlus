// import { Component } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';

// @Component({
//   selector: 'app-confirm-dialog',
//   templateUrl: './confirm-dialog.component.html',
//   styleUrls: ['./confirm-dialog.component.css']
// })
// export class ConfirmDialogComponent {
//   constructor(
//     private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
//     private router: Router,
//     private dialog: MatDialog
//   ) {}
//   deleteDeclaration(id: string): void {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
//       data: { message: 'Êtes-vous sûr de vouloir supprimer cette déclaration ?' }
//     });
//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
//           next: () => {
//             this.declarations = this.declarations.filter(d => d._id !== id);
//           },
//           error: (errors: string[]) => {
//             this.errors = errors;
//           }
//         });
//       }
//     });
// }
// }


// // constructor(
// //   private declarationFiscaleTVAService: DeclarationFiscaleTVAService,
// //   private router: Router,
// //   private dialog: MatDialog
// // ) {}

// // deleteDeclaration(id: string): void {
// //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
// //     data: { message: 'Êtes-vous sûr de vouloir supprimer cette déclaration ?' }
// //   });
// //   dialogRef.afterClosed().subscribe(result => {
// //     if (result) {
// //       this.declarationFiscaleTVAService.deleteDeclaration(id).subscribe({
// //         next: () => {
// //           this.declarations = this.declarations.filter(d => d._id !== id);
// //         },
// //         error: (errors: string[]) => {
// //           this.errors = errors;
// //         }
// //       });
// //     }
// //   });
// // }