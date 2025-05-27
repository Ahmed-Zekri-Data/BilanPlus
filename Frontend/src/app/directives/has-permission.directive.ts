import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PermissionService } from '../services/permission.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit {
  private subscription: Subscription | null = null;
  private permissions: string[] = [];
  private checkType: 'any' | 'all' = 'any';
  private isHidden = true;

  @Input()
  set appHasPermission(permissions: string | string[]) {
    this.permissions = Array.isArray(permissions) ? permissions : [permissions];
    this.updateView();
  }

  @Input()
  set appHasPermissionCheckType(type: 'any' | 'all') {
    this.checkType = type;
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private updateView(): void {
    if (this.permissions.length === 0) {
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = (this.checkType === 'any'
      ? this.permissionService.hasAnyPermission(this.permissions)
      : this.permissionService.hasAllPermissions(this.permissions)
    ).subscribe(hasPermission => {
      if (hasPermission && this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      } else if (!hasPermission && !this.isHidden) {
        this.viewContainer.clear();
        this.isHidden = true;
      }
    });
  }
}
