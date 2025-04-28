import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-details',
  templateUrl: './role-details.component.html',
  styleUrls: ['./role-details.component.css']
})
export class RoleDetailsComponent implements OnInit {
  role: any = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRole(id);
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.roleService.getRoleById(id).subscribe({
      next: (role) => {
        this.role = role;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.message || 'Erreur lors du chargement du rôle.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}