import { Injectable } from '@angular/core';
import { PDFDocument, rgb } from 'pdf-lib';

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
}
