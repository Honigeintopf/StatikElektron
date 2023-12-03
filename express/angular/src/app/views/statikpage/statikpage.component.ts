import { Component, OnInit } from '@angular/core';
import { PdfHttpService } from 'src/app/service/pdfHttp.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PdfGenerateService } from 'src/app/service/pdf-generate.service';
import { PDFDocument, PDFEmbeddedPage } from 'pdf-lib';
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
  constructor(
    private pdfHttpService: PdfHttpService,
    private pdfService: PdfGenerateService
  ) {}

  ngOnInit(): void {
    this.pdfHttpService.getPdfbyProject(this.projectName).subscribe(
      (response) => {},
      (error) => {}
    );
  }

  async generateModifiedPdf() {
    if (!this.pdfs || this.pdfs.length === 0) {
      console.error('No PDFs available');
      return;
    }

    const pdfDoc = await PDFDocument.create();

    for (const pdf of this.pdfs) {
      if (pdf.filePath) {
        try {
          const pdfBuffer = await this.loadPdf(pdf.filePath);
          await this.appendPdfToDocument(pdfDoc, pdfBuffer);
        } catch (error) {
          console.error(`Error loading PDF from ${pdf.filePath}:`, error);
        }
      }

      // Add a page break after each PDF, adjust as needed
      pdfDoc.addPage();
    }

    const headerText = 'Your Custom Header';

    try {
      const modifiedPdfBuffer = await this.pdfService.addHeaderToPdf(
        await pdfDoc.save(),
        headerText
      );

      // Create a Blob from the modified PDF buffer
      const blob = new Blob([modifiedPdfBuffer], { type: 'application/pdf' });

      // Create a downloadable link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'modified.pdf'; // Set the desired filename

      // Append the link to the DOM and trigger a click event to start the download
      document.body.appendChild(link);
      link.click();

      // Remove the link from the DOM
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating modified PDF:', error);
    }
  }

  private async loadPdf(filePath: string): Promise<ArrayBuffer> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load PDF from ${filePath}`);
    }

    return await response.arrayBuffer();
  }
  private async appendPdfToDocument(
    pdfDoc: PDFDocument,
    pdfBuffer: ArrayBuffer
  ): Promise<void> {
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const sourcePages = await pdfDoc.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    );

    for (const sourcePage of sourcePages) {
      const embeddedPage = await pdfDoc.embedPage(sourcePage);
      const page = pdfDoc.addPage();
      page.drawPage(embeddedPage);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  uploadPdf(pdfID: string) {
    if (!this.selectedFile) {
      console.error('No file selected.');
      return;
    }

    this.pdfHttpService
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
    this.pdfHttpService.getPdfbyProject(this.projectName).subscribe(
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
    this.pdfHttpService.getPdfbyProject(this.projectName).subscribe(
      (response) => {
        console.log('PDFs of project:', response);
      },
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  addPdf(name: string, subpoints?: { name: string; file: string }[]): void {
    this.pdfHttpService.createPDF(name, this.projectName).subscribe(
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
    this.pdfHttpService.generateTableOfContents(this.pdfs);
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
