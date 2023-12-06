export interface PDFModel {
  id: number;
  name: string;
  filePath: string;
  projectName: string;
  absoluteFilePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
