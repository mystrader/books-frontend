import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportTableOptions = {
  fileName: string;
  title: string;
  subtitle?: string;
  head: string[];
  body: Array<Array<string | number>>;
};

export function exportTablePdf(options: ExportTableOptions): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  const now = new Date();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(32, 45, 74);
  doc.text(options.title, marginX, 50);

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(90, 99, 120);
    doc.text(options.subtitle, marginX, 68);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 130, 150);
  doc.text(`Gerado em ${now.toLocaleString('pt-BR')}`, marginX, 84);

  autoTable(doc, {
    head: [options.head],
    body: options.body,
    startY: 98,
    margin: { left: marginX, right: marginX, bottom: 36 },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      textColor: [38, 43, 56],
      lineColor: [232, 236, 244],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      lineColor: [30, 64, 175],
    },
    alternateRowStyles: {
      fillColor: [247, 249, 252],
    },
    didDrawPage: (data) => {
      const pageText = `Página ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 160);
      doc.text(pageText, data.settings.margin.left, doc.internal.pageSize.getHeight() - 16);
    },
  });

  doc.save(options.fileName.endsWith('.pdf') ? options.fileName : `${options.fileName}.pdf`);
}
