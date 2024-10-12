const PDFDocument = require('pdfkit');
const path = require('path');

function createPurchaseOrderPDF(purchaseOrder, res, userName) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  // Đăng ký và sử dụng font Roboto
  const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
  const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
  doc.registerFont('Roboto', fontPath);
  doc.registerFont('Roboto-Bold', fontBoldPath);
  
  doc.font('Roboto');

  // Tiêu đề
  doc.font('Roboto-Bold').fontSize(24).text('PHIẾU ĐẶT HÀNG', { align: 'center' });
  doc.moveDown(2);

  // Thông tin đơn hàng
  doc.font('Roboto').fontSize(12);
  doc.text(`Mã đơn: ${purchaseOrder._id}`);
  doc.text(`Ngày đặt hàng: ${new Date(purchaseOrder.createdAt).toLocaleDateString('vi-VN')}`);
  doc.moveDown();

  doc.text(`Sản phẩm: ${purchaseOrder.product.name}`);
  doc.text(`Nhà cung cấp: ${purchaseOrder.supplier.name}`);
  doc.text(`Số lượng đặt: ${purchaseOrder.suggestedQuantity}`);
  doc.text(`Trạng thái: ${purchaseOrder.status}`);
  doc.moveDown();

  doc.text(`Ghi chú: ${purchaseOrder.notes || 'Không có'}`);

  // Phần chữ ký
  doc.moveDown(2);
  doc.text('Người đặt hàng:', { align: 'right' });
  doc.text(userName, { align: 'right' });
  doc.text('____________________', { align: 'right' });
  doc.moveDown();
  doc.text(`Ngày: ${new Date().toLocaleDateString('vi-VN')}`, { align: 'right' });

  doc.end();
}

function createReceiptConfirmationPDF(purchaseOrder, res, userName, currentDate) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  // Đăng ký và sử dụng font Roboto
  const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
  const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
  doc.registerFont('Roboto', fontPath);
  doc.registerFont('Roboto-Bold', fontBoldPath);
  
  doc.font('Roboto');

  // Tiêu đề
  doc.font('Roboto-Bold').fontSize(24).text('PHIẾU NHẬP KHO', { align: 'center' });
  doc.moveDown(2);

  // Thông tin đơn hàng
  doc.font('Roboto').fontSize(12);
  doc.text(`Mã đơn: ${purchaseOrder._id}`);
  doc.text(`Ngày nhập kho: ${currentDate}`);
  doc.moveDown();

  doc.text(`Sản phẩm: ${purchaseOrder.product.name}`);
  doc.text(`Nhà cung cấp: ${purchaseOrder.supplier.name}`);
  doc.text(`Số lượng đặt: ${purchaseOrder.suggestedQuantity}`);
  doc.text(`Số lượng thực nhận: ${purchaseOrder.actualQuantity}`);
  doc.text(`Trạng thái: ${purchaseOrder.status}`);
  doc.moveDown();

  doc.text(`Ghi chú: ${purchaseOrder.notes || 'Không có'}`);

  // Phần chữ ký
  doc.moveDown(2);
  doc.text('Người nhận hàng:', { align: 'right' });
  doc.text(userName, { align: 'right' });
  doc.text('____________________', { align: 'right' });
  doc.moveDown();
  doc.text(`Ngày: ${currentDate}`, { align: 'right' });

  doc.end();
}

module.exports = { createPurchaseOrderPDF, createReceiptConfirmationPDF };
