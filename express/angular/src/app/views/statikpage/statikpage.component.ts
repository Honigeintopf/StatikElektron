import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/service/pdf.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-statikpage',
  templateUrl: './statikpage.component.html',
  styleUrls: ['./statikpage.component.scss'],
})
export class StatikpageComponent implements OnInit {
  newPdfName: string = '';
  pdfs: {
    id: string;
    name: string;
    file?: string;
    subpoints?: { name: string; file: string }[];
  }[] = [];
  isDragAndDropEnabled: boolean = true;
  selectedFile: File | undefined;
  name: string = 'Test';
  projectName: string = 'Statik1';
  constructor(private pdfService: PdfService) {}

  ngOnInit(): void {
    this.pdfService.getPdfbyProject(this.projectName).subscribe(
      (response) => {
        console.log('init Response', response);
      },
      (error) => {
        console.error('Init error', error);
      }
    );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  uploadPdf(pdfID: string) {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }

    this.pdfService
      .uploadPdf(this.selectedFile, pdfID, this.projectName)
      .subscribe(
        (response) => {
          console.log('PDF created:', response);
        },
        (error) => {
          console.error('Error creating PDF:', error);
        }
      );
  }

  getPdfbyProject() {
    this.pdfService.getPdfbyProject(this.projectName).subscribe(
      (response) => {
        console.log('PDFs of project:', response);
      },
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  addPdf(name: string, subpoints?: { name: string; file: string }[]): void {
    this.pdfService.createPDF(name, this.projectName).subscribe(
      (response) => {
        console.log('PDF created', response);
        const id = response.id;
        const name = response.name;
        this.pdfs.push({ id, name });
      },
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  generateTableOfContents(): void {
    this.pdfService.generateTableOfContents(this.pdfs);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pdfs, event.previousIndex, event.currentIndex);
  }

  toggleDragAndDrop(): void {
    this.isDragAndDropEnabled = !this.isDragAndDropEnabled;
  }

  handleButtonClick(pdf: any): void {
    // Handle the button click for the specific PDF
    console.log('Button clicked for:', pdf);
  }
}
