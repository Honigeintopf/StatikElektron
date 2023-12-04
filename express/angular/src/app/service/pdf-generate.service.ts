import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';
import pdfMake from 'pdfmake/build/pdfmake';

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
  constructor() {}

  generateTableOfContents(
    pdfs: {
      name: string;
      file?: string;
      subpoints?: { name: string; file: string }[];
    }[]
  ): void {
    const content = [
      { text: 'Table of Contents', style: 'header' },
      { text: '\n', style: 'subheader' },
    ];

    pdfs.forEach((pdf, index) => {
      const pdfText = `${index + 1}. ${pdf.name}`;

      content.push({ text: pdfText, style: 'subheader' });

      if (pdf.subpoints && pdf.subpoints.length > 0) {
        pdf.subpoints.forEach((subpoint, subIndex) => {
          const subpointText = `${index + 1}.${subIndex + 1} ${subpoint.name}`;
          content.push({ text: subpointText, style: 'sub-subheader' });
        });
      }
    });

    const documentDefinition = {
      content,
      styles: {
        header: {
          fontSize: 18,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
        'sub-subheader': {
          fontSize: 12,
          italic: true,
        },
      },
    };

    pdfMake.createPdf(documentDefinition).open();
  }
}
