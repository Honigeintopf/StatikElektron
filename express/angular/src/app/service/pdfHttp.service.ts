import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Observable } from 'rxjs';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root',
})
export class PdfHttpService {
  private apiUrl = 'http://localhost:3000/api/pdf'; // Adjust the URL based on your server configuration

  constructor(private http: HttpClient) {}

  uploadPdf(file: File, id: string, projectName: string): Observable<any> {
    const formData = new FormData();
    const newFileName = `${projectName}-${file.name}`;
    const uploadFilePath = `/assets/allPdfUploads/${newFileName}`;
    formData.append('file', file, newFileName);
    formData.append('id', id);
    formData.append('projectName', projectName);
    formData.append('uploadFilePath', uploadFilePath);
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

  deletePDF(id: string): Observable<any> {
    const deleteEndpoint = `${this.apiUrl}/delete/${id}`;
    return this.http.delete(deleteEndpoint);
  }
}
