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
    filePath?: string;
    subpoints?: { name: string; file: string }[];
  }[] = [];
  isDragAndDropEnabled: boolean = true;
  selectedFile: File | undefined;
  projectName: string = 'Statik1';
  pdfSrc = 'assets/allPdfUploads/Statik1-Videocodecs_Ebubekir_ates.pdf';
  constructor(private pdfService: PdfService) {}

  ngOnInit(): void {
    this.pdfService.getPdfbyProject(this.projectName).subscribe(
      (response) => {},
      (error) => {}
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
          console.log('PDF uploaded:');
          this.updatePDFsArray();
        },
        (error) => {
          console.error('Error creating PDF:', error);
        }
      );
  }

  updatePDFsArray() {
    this.pdfService.getPdfbyProject(this.projectName).subscribe(
      (response) => {
        this.pdfs = response.files.map((file: any) => {
          return {
            id: file.id.toString(),
            name: file.name,
            filePath: file.filePath,
            subpoints: file.subpoints,
          };
        });
      },
      (error) => {
        console.error('updatePDFSARRAYERROR', error);
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

  getPdfPathsByProject() {
    this.pdfService.getPdfPathsByProject(this.projectName).subscribe(
      (response) => {
        console.log('PDF paths of project:', response);
      },
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  addPdf(name: string, subpoints?: { name: string; file: string }[]): void {
    this.pdfService.createPDF(name, this.projectName).subscribe(
      (response) => {
        console.log('PDF created');
        this.updatePDFsArray();
      },
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  getColorForPdf(pdf: any): string {
    return pdf.filePath ? 'black' : 'red';
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
    console.log('Button clicked for:');
  }
}
