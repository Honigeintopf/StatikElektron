import { Component, OnInit } from '@angular/core';
import { PdfHttpService } from 'src/app/service/pdfHttp.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PdfGenerateService } from 'src/app/service/pdf-generate.service';
import { PDFDocument, PDFEmbeddedPage } from 'pdf-lib';
import { PDFModel } from './pdf-model.interface';
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
  selectedFiles: { [pdfId: string]: File } = {};
  projectName: string = 'Statik1';
  hasSpecialCharacters: boolean = false;
  srcTest = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

  constructor(
    private pdfHttpService: PdfHttpService,
    private pdfService: PdfGenerateService
  ) {}

  ngOnInit(): void {}

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
      link.download = 'GenerierteStatik.pdf'; // Set the desired filename

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
    pdfBuffer: ArrayBuffer,
    scale: number = 0.8 // Default scale is 80%
  ): Promise<void> {
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const sourcePages = await pdfDoc.copyPages(
      sourcePdf,
      sourcePdf.getPageIndices()
    );

    for (const sourcePage of sourcePages) {
      const embeddedPage = await pdfDoc.embedPage(sourcePage);
      const page = pdfDoc.addPage();

      const { width, height } = sourcePage.getSize();
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;

      // Calculate the position to center the scaled content within the target page
      const xOffset = (page.getWidth() - scaledWidth) / 2;
      const yOffset = (page.getHeight() - scaledHeight) / 2;

      // Draw the scaled page content with empty space around it
      page.drawPage(embeddedPage, {
        x: xOffset,
        y: yOffset,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  onFileSelected(event: any, pdfId: string, edit: boolean) {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      console.error('No file selected for PDF with ID:', pdfId);
      return;
    }

    // Check for special characters in the file name
    const hasSpecialCharacters = /[äöü]/.test(selectedFile.name);

    if (hasSpecialCharacters) {
      console.error(
        'File name contains special characters. Please choose a different file.'
      );
      this.hasSpecialCharacters = true; // Set the flag to true
      // You can also display an error message to the user here
      return;
    }
    this.hasSpecialCharacters = false;
    this.selectedFiles[pdfId] = selectedFile;
    if (edit) {
      this.updatePdf(pdfId);
    } else {
      this.uploadPdf(pdfId);
    }
  }

  updatePdf(pdfID: string) {
    const selectedFile = this.selectedFiles[pdfID];
    if (!selectedFile) {
      console.error('No file selected for PDF with ID:', pdfID);
      return;
    }

    this.pdfHttpService.deleteFileOnly(pdfID).subscribe(
      (response) => {
        console.log('PDF deleted successfully', response);
        // Perform any additional actions after deletion
      },
      (error) => {
        console.error('Error deleting PDF:', error);
      }
    );
    this.pdfHttpService
      .updatePDF(selectedFile, pdfID, this.projectName)
      .subscribe(
        (response) => {
          console.log('PDF uploaded:', response);
          this.updatePDFsArray();
        },
        (error) => {
          console.error('Error uploading PDF:', error);
        }
      );
  }

  uploadPdf(pdfID: string) {
    const selectedFile = this.selectedFiles[pdfID];

    if (!selectedFile) {
      console.error('No file selected for PDF with ID:', pdfID);
      return;
    }

    this.pdfHttpService
      .uploadPdf(selectedFile, pdfID, this.projectName)
      .subscribe(
        (response) => {
          console.log('PDF uploaded:', response);
          this.updatePDFsArray();
        },
        (error) => {
          console.error('Error uploading PDF:', error);
        }
      );
  }
  async updatePDFsArray(): Promise<void> {
    try {
      const response = await this.pdfHttpService
        .getPdfbyProject(this.projectName)
        .toPromise();

      this.pdfs = response.files.map((file: any) => {
        return {
          id: file.id.toString(),
          name: file.name,
          filePath: file.filePath,
          subpoints: file.subpoints,
        };
      });
    } catch (error) {
      console.error('updatePDFSARRAYERROR', error);
    }
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

  deletePdf(id: string): void {
    this.pdfHttpService.deletePDF(id).subscribe(
      (response) => {
        console.log('PDF deleted successfully', response);
        this.updatePDFsArray(); // Update the PDFs array after deletion
        // Perform any additional actions after successful deletion
      },
      (error) => {
        console.error('Error deleting PDF', error);
        // Handle error, display a message, etc.
      }
    );
  }
  async addPdf(
    name: string,
    subpoints?: { name: string; file: string }[]
  ): Promise<PDFModel> {
    try {
      const response = await this.pdfHttpService
        .createPDF(name, this.projectName)
        .toPromise();
      console.log('PDF created:', response);

      // Assuming response contains information about the created PDF
      const createdPdf: PDFModel = {
        id: response.id.toString(),
        name: response.name,
        filePath: response.filePath,
        projectName: response.projectName,
      };

      console.log(createdPdf);
      await this.updatePDFsArray();

      return createdPdf;
    } catch (error) {
      console.error('Error creating PDF:', error);
      throw error; // Re-throw the error to be handled by the calling code
    }
  }

  getColorForPdf(pdf: any): string {
    return pdf.filePath ? 'black' : '#794853';
  }

  async generateTableOfContents(
    inhaltsverzeichnissPdf: PDFModel
  ): Promise<void> {
    this.pdfService.generateTableOfContents(this.pdfs, inhaltsverzeichnissPdf);
  }

  async generateDefaultPDFs(): Promise<void> {
    try {
      // Create 'Deckblatt' PDF
      await this.addPdf('Deckblatt');

      // Create 'Inhaltsverzeichniss' PDF and get the returned PDFModel
      const inhaltsverzeichnissPdf: PDFModel = await this.addPdf(
        'Inhaltsverzeichniss'
      );

      await this.generateTableOfContents(inhaltsverzeichnissPdf);
      await this.updatePDFsArray();
      console.log(this.pdfs);
    } catch (error) {
      console.error('Error in generateDefaultPDFs:', error);
    }
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
