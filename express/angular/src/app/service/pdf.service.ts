import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private apiUrl = 'http://localhost:3000/api/pdf'; // Adjust the URL based on your server configuration

  constructor(private http: HttpClient) {}

  uploadPdf(file: File, name: string, projectName: string): Observable<any> {
    const formData = new FormData();
    const newFileName = `${projectName}-${file.name}`;

    formData.append('file', file, newFileName);
    formData.append('name', name);
    formData.append('projectName', projectName);
    const createEndpoint = `${this.apiUrl}/upload`;

    return this.http.post(createEndpoint, formData);
  }

  // New method to get files by projectName
  getPdfbyProject(projectName: string): Observable<any> {
    const files = `${this.apiUrl}/files/${projectName}`;
    return this.http.get(files);
  }

  createPDF(name: string, projectName: string): Observable<any> {
    const createEndpoint = `${this.apiUrl}/create`;
    return this.http.post(createEndpoint, { name, projectName });
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
