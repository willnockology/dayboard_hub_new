const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Function to create PDF from form data
const createPDF = (formData, user) => {
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `../uploads/${formData.formId}-${Date.now()}.pdf`);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text(`Form: ${formData.formId}`, { align: 'center' });
  doc.moveDown();

  formData.fields.forEach(field => {
    doc.fontSize(12).text(`${field.field_title}: ${field.field_value}`);
    doc.moveDown();
  });

  doc.fontSize(12).text(`Completed by: ${user.firstName} ${user.lastName}`);
  doc.fontSize(12).text(`Completed at: ${formData.completedAt}`);

  doc.end();

  return filePath;
};

module.exports = { createPDF };
