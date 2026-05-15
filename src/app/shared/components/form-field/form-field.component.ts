import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>{{ label() }}</mat-label>
      <input matInput [type]="type()" [name]="name()" [ngModel]="value()" (ngModelChange)="value.set($event)" [required]="required()" />
      @if (hint()) {
        <mat-hint>{{ hint() }}</mat-hint>
      }
    </mat-form-field>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly name = input.required<string>();
  readonly type = input('text');
  readonly hint = input('');
  readonly required = input(false);
  readonly value = model<string>('');
}
