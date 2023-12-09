import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bauteildialog',
  templateUrl: './bauteildialog.component.html',
  styleUrls: ['./bauteildialog.component.scss'],
})
export class BauteildialogComponent {
  newBauteil: string;

  constructor(
    public dialogRef: MatDialogRef<BauteildialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { currentBauteil: string }
  ) {
    this.newBauteil = data.currentBauteil;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    // You can add further logic here if needed
    this.dialogRef.close(this.newBauteil);
  }
}
