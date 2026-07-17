import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-input',
  imports: [],
  templateUrl: './edit-input.html',
  styleUrl: './edit-input.css',
})
export class EditInput {
  readonly dialogRef = inject(MatDialogRef<EditInput>);
  readonly data = inject<InputDialogModel>(MAT_DIALOG_DATA);
   
}

export interface InputDialogModel {

}
