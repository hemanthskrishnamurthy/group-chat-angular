import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { Employee } from '../../models/hrms.models';
import { EmployeeStore } from '../../core/state/employee.store';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatCardModule, MatInputModule, MatFormFieldModule, DataTableComponent, FormFieldComponent],
  template: `
    <section class="page-header">
      <div>
        <h1>Employee Management</h1>
        <p>Onboarding, profiles, departments, documents, and timeline activity.</p>
      </div>
      <mat-form-field appearance="outline">
        <mat-label>Search employees</mat-label>
        <input matInput [ngModel]="store.query()" (ngModelChange)="store.query.set($event)" />
      </mat-form-field>
    </section>

    <section class="work-grid">
      <mat-card class="form-panel">
        <h2>Onboard Employee</h2>
        <app-form-field label="Employee ID" name="employeeId" [value]="draft.employeeId()" (valueChange)="draft.employeeId.set($event)" [required]="true" />
        <app-form-field label="Name" name="name" [value]="draft.name()" (valueChange)="draft.name.set($event)" [required]="true" />
        <app-form-field label="Email" name="email" type="email" [value]="draft.email()" (valueChange)="draft.email.set($event)" [required]="true" />
        <app-form-field label="Phone" name="phone" [value]="draft.phone()" (valueChange)="draft.phone.set($event)" [required]="true" />
        <app-form-field label="Department" name="department" [value]="draft.department()" (valueChange)="draft.department.set($event)" [required]="true" />
        <app-form-field label="Designation" name="designation" [value]="draft.designation()" (valueChange)="draft.designation.set($event)" [required]="true" />
        <button mat-flat-button color="primary" type="button" [disabled]="!canSave()" (click)="save()">Create employee</button>
      </mat-card>

      <mat-card>
        <h2>Employee Directory</h2>
        @if (store.loading()) {
          <div class="skeleton-list"><span></span><span></span><span></span></div>
        } @else {
          <app-data-table [rows]="store.filteredEmployees()" [columns]="columns" />
        }
      </mat-card>
    </section>
  `,
})
export class EmployeesComponent {
  readonly store = inject(EmployeeStore);
  readonly draft = {
    employeeId: signal(''),
    name: signal(''),
    email: signal(''),
    phone: signal(''),
    department: signal(''),
    designation: signal(''),
  };

  readonly canSave = computed(() => Object.values(this.draft).every((field) => field().trim().length > 1));
  readonly columns: TableColumn<Employee>[] = [
    { key: 'employeeId', label: 'Employee ID' },
    { key: 'name', label: 'Name' },
    { key: 'department', label: 'Department' },
    { key: 'designation', label: 'Designation' },
    { key: 'status', label: 'Status' },
  ];

  save(): void {
    this.store.add({
      employeeId: this.draft.employeeId(),
      name: this.draft.name(),
      email: this.draft.email(),
      phone: this.draft.phone(),
      department: this.draft.department(),
      designation: this.draft.designation(),
      joiningDate: new Date().toISOString().slice(0, 10),
      salary: 0,
      status: 'Onboarding',
    });
    Object.values(this.draft).forEach((field) => field.set(''));
  }
}
