import { Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [MatTableModule],
  template: `
    <div class="table-wrap">
      <table mat-table [dataSource]="rows()" class="enterprise-table">
        @for (column of columns(); track column.key) {
          <ng-container [matColumnDef]="column.key">
            <th mat-header-cell *matHeaderCellDef>{{ column.label }}</th>
            <td mat-cell *matCellDef="let row">{{ row[column.key] }}</td>
          </ng-container>
        }
        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>
    </div>
  `,
})
export class DataTableComponent<T extends object> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<TableColumn<T>[]>();

  displayedColumns(): string[] {
    return this.columns().map((column) => column.key);
  }
}
