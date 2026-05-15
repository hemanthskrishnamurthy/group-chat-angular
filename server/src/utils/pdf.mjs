import PDFDocument from 'pdfkit';

export function createPayslipPdf(payroll, employee) {
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.fontSize(20).text('Enterprise HRMS Payslip', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Employee: ${employee?.name ?? 'Demo Employee'}`);
  doc.text(`Employee ID: ${employee?.employeeId ?? 'EMP-DEMO'}`);
  doc.text(`Period: ${payroll?.month ?? '05'}/${payroll?.year ?? '2026'}`);
  doc.moveDown();
  doc.text(`Gross Salary: ${payroll?.grossSalary ?? 100000}`);
  doc.text(`Bonuses: ${payroll?.bonuses ?? 5000}`);
  doc.text(`Deductions: ${payroll?.deductions ?? 2000}`);
  doc.text(`Tax: ${payroll?.tax ?? 10000}`);
  doc.fontSize(14).text(`Net Salary: ${payroll?.netSalary ?? 93000}`);
  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
}
