import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import pdfMake from 'pdfmake/build/pdfmake';
import { PdfHttpService } from './pdfHttp.service';
import { PDFModel } from '../views/statikpage/pdf-model.interface';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable({
  providedIn: 'root',
})
export class PdfGenerateService {
  async addHeaderToPdf(
    originalPdfBuffer: ArrayBuffer,
    headerText: string
  ): Promise<ArrayBuffer> {
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    const pages = pdfDoc.getPages();
    console.log('Pages');

    // Add header to each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      const headerHeight = 50; // Set the height of your header

      // Add a rectangle as a header
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
        color: rgb(0.8, 0.8, 0.8), // Set the color of your header
      });

      // Add text to the header
      page.drawText(headerText, {
        x: 20,
        y: height - headerHeight + 15, // Adjust the position of your text
        size: 12, // Set the font size of your text
        color: rgb(0, 0, 0), // Set the color of your text
      });
    }

    // Save the modified PDF
    return await pdfDoc.save();
  }
  constructor(private pdfHttpService: PdfHttpService) {}

  getNumberOfPages(pdfBuffer: ArrayBuffer): Promise<number> {
    return PDFDocument.load(pdfBuffer).then((pdfDoc) => {
      return pdfDoc.getPageCount();
    });
  }
  async generateTableOfContents(
    pdfs: {
      name: string;
      file?: string;
      subpoints?: { name: string; file: string }[];
    }[],
    inhaltsverzeichnissPdf: PDFModel // Pass the Inhaltsverzeichniss PDF entry from the DB
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const content = [
          { text: 'Inhaltsverzeichniss', style: 'header' },
          { text: '\n', style: 'subheader' },
        ];

        pdfs.forEach((pdf, index) => {
          const pdfText = `${index + 1}. ${pdf.name}`;

          content.push({ text: pdfText, style: 'subheader' });

          if (pdf.subpoints && pdf.subpoints.length > 0) {
            pdf.subpoints.forEach((subpoint, subIndex) => {
              const subpointText = `${index + 1}.${subIndex + 1} ${
                subpoint.name
              }`;
              content.push({ text: subpointText, style: 'sub-subheader' });
            });
          }
        });
        const documentDefinition: TDocumentDefinitions = {
          content,
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            subheader: {
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 5],
            },
            'sub-subheader': {
              fontSize: 12,
              italics: true,
              margin: [0, 0, 0, 2],
            },
          },
        };

        // Create the PDF
        const generatedPdf = pdfMake.createPdf(documentDefinition);

        // Convert the generated PDF to a Blob
        generatedPdf.getBlob(async (blob: Blob) => {
          // Create a new File from the Blob
          const generatedPdfFile = new File([blob], 'GeneratedPDF.pdf', {
            type: 'application/pdf',
          });

          // Update the entry in the database with the new file using the updatePDF method
          await this.pdfHttpService
            .updatePDF(
              generatedPdfFile,
              inhaltsverzeichnissPdf.id.toString(),
              inhaltsverzeichnissPdf.projectName
            )
            .toPromise();

          console.log('Inhaltsverzeichniss PDF updated');
          // Perform any additional actions after updating the entry

          // Resolve the promise to indicate that the operation is complete
          resolve();
        });
      } catch (error) {
        console.error('Error generating and updating PDF:', error);
        reject(error);
      }
    });
  }
}
