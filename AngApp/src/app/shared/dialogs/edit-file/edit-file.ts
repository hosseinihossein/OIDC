import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-file',
  imports: [],
  templateUrl: './edit-file.html',
  styleUrl: './edit-file.css',
})
export class EditFile {
  readonly dialogRef = inject(MatDialogRef<EditFile>);
  readonly data = inject<FileDialogModel>(MAT_DIALOG_DATA);
  

}

export interface FileDialogModel {

}
