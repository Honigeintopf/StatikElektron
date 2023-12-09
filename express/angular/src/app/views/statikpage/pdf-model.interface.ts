export interface PDFModel {
  id: number;
  name: string;
  filePath: string;
  projectName: string;
  positionInArray: number;
  absoluteFilePath?: string;
  createdAt?: Date;
  updatedAt?: Date;
  range?: { start: number; end: number };
}
