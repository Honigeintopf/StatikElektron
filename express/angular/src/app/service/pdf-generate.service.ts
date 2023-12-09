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
    pdfs: any[],
    project: string
  ): Promise<ArrayBuffer> {
    const pdfDoc = await PDFDocument.load(originalPdfBuffer);
    const pages = pdfDoc.getPages();

    // Load the image from the assets folder
    const imagePath = `./assets/91001.png`;
    const imageResponse = await fetch(imagePath);
    const imageBlob = await imageResponse.blob();
    const imageBytes = await new Response(imageBlob).arrayBuffer();

    // Create a PDFImage object from the image data
    const image = await pdfDoc.embedPng(imageBytes);
    for (const pdf of pdfs) {
      const { range, bauteil, name } = pdf;

      if (range && name !== 'Deckblatt' && name !== 'Inhaltsverzeichniss') {
        const startPage = range.start;
        const endPage = range.end;

        for (let i = startPage - 1; i < endPage; i++) {
          const page = pages[i];

          if (page) {
            const { width, height } = page.getSize();
            const headerHeight = 80;

            page.drawRectangle({
              x: 0,
              y: height - headerHeight,
              width,
              height: headerHeight,
              color: rgb(0.8, 0.8, 0.8),
            });

            page.drawText(`Projekt: ${project}`, {
              x: 20,
              y: height - headerHeight + 15,
              size: 12,
              color: rgb(0, 0, 0),
            });

            page.drawText(`Bauteil: ${bauteil}`, {
              x: 20,
              y: height - headerHeight + 30,
              size: 12,
              color: rgb(0, 0, 0),
            });
            const imageWidth = 50;
            const imageHeight = 50;
            const imageX = width / 3;
            const imageY = height - headerHeight + 15;
            page.drawImage(image, {
              x: imageX,
              y: imageY,
              width: imageWidth,
              height: imageHeight,
            });

            const currentDate = new Date().toLocaleDateString();
            const pageNumber = i + 1;

            page.drawText(`Datum: ${currentDate}`, {
              x: width - 120,
              y: height - headerHeight + 15,
              size: 12,
              color: rgb(0, 0, 0),
            });

            page.drawText(`Seite: ${pageNumber}`, {
              x: width - 120,
              y: height - headerHeight + 30,
              size: 12,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
    }

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
    inhaltsverzeichnissPdf: PDFModel,
    deckblattPdf: PDFModel
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const content = [];

        // Add the header
        const header = {
          text: 'Inhaltsverzeichniss',
          style: 'header', // Apply a style if needed
        };
        content.push(header);

        // Add the main Table of Contents definition
        const tocDefinition = {
          columns: [
            {
              width: '75%', // Adjust width as needed
              stack: pdfs.map((pdf, index) => ` ${pdf.name}`),
            },
            {
              width: '*', // Adjust width as needed
              stack: ['1'], // Hardcoded page number for now
            },
          ],
          columnGap: 20, // Adjust the gap between columns
        };

        content.push(tocDefinition);

        // Add a placeholder page number for the TOC
        content.push({
          text: ' ', // Add a space as a placeholder
        });

        const documentDefinition: TDocumentDefinitions = {
          content,
          styles: {
            header: {
              fontSize: 30,
              bold: true,
              margin: [0, 0, 0, 40],
            },
            subheader: {
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 10],
            },
            'sub-subheader': {
              fontSize: 12,
              italics: true,
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
              inhaltsverzeichnissPdf.projectName,
              '1'
            )
            .toPromise();

          // Perform any additional actions after updating the entry

          // Resolve the promise to indicate that the operation is complete
          resolve();
        });

        // DECKBLATTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
        const documentDefinitionDeckblatt: TDocumentDefinitions = {
          content: [
            {
              text: 'Deckblatt', // Text content
              fontSize: 30, // Font size
              bold: true, // Bold style
              alignment: 'center', // Center the text
            },
          ],
        };
        const generatedPdfDeckblatt = pdfMake.createPdf(
          documentDefinitionDeckblatt
        );

        generatedPdfDeckblatt.getBlob(async (blob: Blob) => {
          const generatedPdfFileDeckblatt = new File(
            [blob],
            'GeneratedPDFDeckblatt.pdf',
            {
              type: 'application/pdf',
            }
          );

          await this.pdfHttpService
            .updatePDF(
              generatedPdfFileDeckblatt,
              deckblattPdf.id.toString(),
              deckblattPdf.projectName,
              '1'
            )
            .toPromise();

          resolve();
        });
      } catch (error) {
        console.error('Error generating and updating PDF:', error);
        reject(error);
      }

      console.log('Inhaltsverzeichniss PDF updated');
    });
  }
}
