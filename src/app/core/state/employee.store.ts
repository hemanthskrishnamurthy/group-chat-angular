import { Injectable, computed, signal } from '@angular/core';
import { Employee } from '../../models/hrms.models';

const seededEmployees: Employee[] = [
  { employeeId: 'EMP-1001', name: 'Aarav Sharma', email: 'aarav@company.com', phone: '+91 90000 1001', department: 'Engineering', designation: 'Senior Developer', joiningDate: '2023-04-10', salary: 1850000, status: 'Active' },
  { employeeId: 'EMP-1002', name: 'Maya Iyer', email: 'maya@company.com', phone: '+91 90000 1002', department: 'People Ops', designation: 'HR Manager', joiningDate: '2022-08-22', salary: 1650000, status: 'Active' },
  { employeeId: 'EMP-1003', name: 'Kabir Khan', email: 'kabir@company.com', phone: '+91 90000 1003', department: 'Sales', designation: 'Regional Manager', joiningDate: '2021-11-15', salary: 2100000, status: 'On Leave' },
];

@Injectable({ providedIn: 'root' })
export class EmployeeStore {
  readonly employees = signal<Employee[]>(seededEmployees);
  readonly query = signal('');
  readonly loading = signal(false);

  readonly filteredEmployees = computed(() => {
    const term = this.query().toLowerCase().trim();
    return this.employees().filter((employee) =>
      [employee.employeeId, employee.name, employee.email, employee.department, employee.designation].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  add(employee: Employee): void {
    this.employees.update((employees) => [{ ...employee, status: 'Onboarding' }, ...employees]);
  }
}
