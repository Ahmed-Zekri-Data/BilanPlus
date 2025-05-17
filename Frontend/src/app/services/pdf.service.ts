import { Injectable } from '@angular/core';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

declare var pdfMake: any;
declare var pdfFonts: any;

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {
    // Initialize PDFMake with virtual file system
    if (typeof window !== 'undefined') {
      const pdfMake = (window as any).pdfMake;
      const pdfFonts = (window as any).pdfFonts;
      if (pdfMake && pdfFonts) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }
    }
  }

  generatePdf(docDefinition: TDocumentDefinitions, fileName: string): void {
    if (typeof window !== 'undefined') {
      const pdfMake = (window as any).pdfMake;
      if (pdfMake) {
        pdfMake.createPdf(docDefinition).download(fileName);
      }
    }
  }
} 