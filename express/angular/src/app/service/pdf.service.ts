import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private apiUrl = 'http://localhost:3000/api/pdf/create'; // Adjust the URL based on your server configuration

  constructor(private http: HttpClient) {}

  uploadPdf(filePath: string, name: string) {
    const requestData = { name, filePath };

    return this.http.post(`${this.apiUrl}`, requestData);
  }
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
