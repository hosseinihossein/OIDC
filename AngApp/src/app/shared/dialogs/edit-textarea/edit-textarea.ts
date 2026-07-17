import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-textarea',
  imports: [],
  templateUrl: './edit-textarea.html',
  styleUrl: './edit-textarea.css',
})
export class EditTextarea {
  readonly dialogRef = inject(MatDialogRef<EditTextarea>);
  readonly data = inject<TextDialogModel>(MAT_DIALOG_DATA);
  
}

export interface TextDialogModel {

}
