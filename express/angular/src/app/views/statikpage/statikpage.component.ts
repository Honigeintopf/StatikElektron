import { Component, OnInit } from '@angular/core';
import { PdfHttpService } from 'src/app/service/pdfHttp.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PdfGenerateService } from 'src/app/service/pdf-generate.service';
import { PDFDocument, PDFEmbeddedPage } from 'pdf-lib';
import { PDFModel } from './pdf-model.interface';
import { MatDialog } from '@angular/material/dialog';
import { BauteildialogComponent } from 'src/app/dialog/bauteildialog/bauteildialog.component';
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
    positionInArray: number;
    projectName: string;
    numPages: number;
    filePath?: string;
    subpoints?: { name: string; file: string }[];
    bauteil?: string; // Add this field with nullable type
    range?: { start: number; end: number };
  }[] = [];

  totalNumPages: number = 0;
  isDragAndDropEnabled: boolean = true;
  selectedFiles: { [pdfId: string]: File } = {};
  projectName: string = 'Statik1';
  hasSpecialCharacters: boolean = false;
  srcTest = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';

  constructor(
    private pdfHttpService: PdfHttpService,
    private pdfService: PdfGenerateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.addPdf('Deckblatt');
    this.addPdf('Inhaltsverzeichniss');
  }

  async generateModifiedPdf() {
    if (!this.pdfs || this.pdfs.length === 0) {
      console.error('No PDFs available');
      return;
    }

    try {
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

      const modifiedPdfBuffer = await this.pdfService.addHeaderToPdf(
        await pdfDoc.save(),
        this.pdfs,
        this.projectName
      );

      const blob = new Blob([modifiedPdfBuffer], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'GenerierteStatik.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating modified PDF:', error);
    }
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
  private async loadPdf(filePath: string): Promise<ArrayBuffer> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to load PDF from ${filePath}`);
    }

    return await response.arrayBuffer();
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

  async updatePdf(pdfID: string) {
    const selectedFile = this.selectedFiles[pdfID];
    if (!selectedFile) {
      console.error('No file selected for PDF with ID:', pdfID);
      return;
    }

    try {
      // Delete the existing PDF
      await this.pdfHttpService.deleteFileOnly(pdfID).toPromise();

      // Calculate the number of pages
      const selectedFileArrayBuffer = await selectedFile.arrayBuffer();
      const numPages = await this.pdfService.getNumberOfPages(
        selectedFileArrayBuffer
      );

      // Update the PDF with the new file and number of pages
      await this.pdfHttpService
        .updatePDF(selectedFile, pdfID, this.projectName, numPages.toString())
        .toPromise();

      // Update the array of PDFs
      this.updatePDFsArray();
    } catch (error) {
      console.error('Error updating PDF:', error);
    }
  }

  async uploadPdf(pdfID: string) {
    const selectedFile = this.selectedFiles[pdfID];

    if (!selectedFile) {
      console.error('No file selected for PDF with ID:', pdfID);
      return;
    }

    try {
      // Get the number of pages
      const selectedFileArrayBuffer = await selectedFile.arrayBuffer();
      const numPages = await this.pdfService.getNumberOfPages(
        selectedFileArrayBuffer
      );

      // Upload the PDF with the correct numPages value
      await this.pdfHttpService
        .uploadPdf(selectedFile, pdfID, this.projectName, numPages.toString())
        .toPromise();

      // Update the array of PDFs
      this.updatePDFsArray();
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  }

  async updatePDFsArray(): Promise<void> {
    try {
      const response = await this.pdfHttpService
        .getPdfbyProject(this.projectName)
        .toPromise();

      this.pdfs = response.files
        .map((file: any) => {
          return {
            id: file.id.toString(),
            name: file.name,
            filePath: file.filePath,
            subpoints: file.subpoints,
            positionInArray: file.positionInArray,
            numPages: file.numPages,
            bauteil: file.bauteil,
            range: { start: 0, end: 0 }, // Initialize range
          };
        })
        .sort(
          (a: { positionInArray: number }, b: { positionInArray: number }) =>
            a.positionInArray - b.positionInArray
        );
      this.updateRangeValues();
      this.updateNumPages();
    } catch (error) {
      console.error('updatePDFSARRAYERROR', error);
    }
  }

  getPdfbyProject() {
    this.pdfHttpService.getPdfbyProject(this.projectName).subscribe(
      (response) => {},
      (error) => {
        console.error('Error creating PDF:', error);
      }
    );
  }

  deletePdf(id: string): void {
    this.pdfHttpService.deletePDF(id).subscribe(
      (response) => {
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
      let positionInArray = 0; // Default position at the beginning
      let response;
      // Check if it's one of the default PDFs
      if (name === 'Deckblatt') {
        positionInArray = 0;
      } else if (name === 'Inhaltsverzeichniss') {
        positionInArray = 1;
      }

      if (name === 'Deckblatt' || name === 'Inhaltsverzeichniss') {
        response = await this.pdfHttpService
          .createPDF(name, this.projectName, positionInArray, '1')
          .toPromise();
      } else {
        response = await this.pdfHttpService
          .createPDF(name, this.projectName, this.pdfs.length, '1')
          .toPromise();
      }

      const createdPdf: PDFModel = {
        id: response.id.toString(),
        name: response.name,
        filePath: response.filePath,
        projectName: response.projectName,
        positionInArray: response.positionInArray,
        range: {
          start: this.totalNumPages,
          end: this.totalNumPages + response.numPages - 1,
        },
      };

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

  async generateTableOfContentsandDeckblatt(
    inhaltsverzeichnissPdf: PDFModel,
    deckblattPdf: PDFModel
  ): Promise<void> {
    await this.pdfService.generateTableOfContents(
      this.pdfs,
      inhaltsverzeichnissPdf,
      deckblattPdf
    );
  }

  async generateDefaultPDFs(): Promise<void> {
    try {
      // Create 'Deckblatt' PDF
      const DeckblattPdf: PDFModel = await this.addPdf('Deckblatt');
      // Create 'Inhaltsverzeichniss' PDF and get the returned PDFModel
      const inhaltsverzeichnissPdf: PDFModel = await this.addPdf(
        'Inhaltsverzeichniss'
      );
      await this.generateTableOfContentsandDeckblatt(
        inhaltsverzeichnissPdf,
        DeckblattPdf
      );
      await this.updatePDFsArray();
      console.log(this.pdfs);
    } catch (error) {
      console.error('Error in generateDefaultPDFs:', error);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pdfs, event.previousIndex, event.currentIndex);
    this.pdfs.forEach((pdf, index) => {
      pdf.positionInArray = index;
    });
    console.log(this.pdfs);
    this.updateRangeValues();
    this.savePositionsToDatabase();
    this.updateNumPages();
  }

  private savePositionsToDatabase(): void {
    const updatedPdfs = this.pdfs.map((pdf) => {
      return { id: pdf.id, newPosition: pdf.positionInArray };
    });

    this.pdfHttpService
      .updatePdfPositions(this.projectName, updatedPdfs)
      .subscribe(
        (response) => {
          console.log('Positions updated successfully.', response);
          // Perform any additional actions after updating positions
        },
        (error) => {
          console.error('Error updating positions.', error);
        }
      );
  }

  toggleDragAndDrop(): void {
    this.isDragAndDropEnabled = !this.isDragAndDropEnabled;
  }

  handleButtonClick(pdf: any): void {
    // Handle the button click for the specific PDF
    console.log('Button clicked for:');
  }

  private calculateTotalNumPages() {
    this.totalNumPages = this.pdfs.reduce((sum, pdf) => sum + pdf.numPages, 0);
  }

  // Call this function whenever there's a change in the PDF array
  private updateNumPages() {
    this.calculateTotalNumPages();
  }

  private updateRangeValues(): void {
    let startPage = 1;

    for (const pdf of this.pdfs) {
      const endPage = startPage + pdf.numPages - 1;
      pdf.range = { start: startPage, end: endPage };
      startPage = endPage + 1;
    }
  }
  editBauteil(id: string, currentBauteil?: string): void {
    const dialogRef = this.dialog.open(BauteildialogComponent, {
      width: '350px',
      data: { currentBauteil },
    });

    dialogRef.afterClosed().subscribe((newBauteil) => {
      if (newBauteil) {
        // Call the service to update 'bauteil'
        this.pdfHttpService.updateBauteil(id, newBauteil).subscribe(
          (response) => {
            console.log('Bauteil updated successfully:', response);
            this.updatePDFsArray();
            console.log('this.pdfs', this.pdfs);
            // Handle success if needed
          },
          (error) => {
            console.error('Error updating Bauteil:', error);
            // Handle error if needed
          }
        );
      }
    });
  }
}
