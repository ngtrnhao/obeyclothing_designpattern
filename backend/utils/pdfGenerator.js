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

function createInvoicePDF(invoice, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
  const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
  doc.registerFont('Roboto', fontPath);
  doc.registerFont('Roboto-Bold', fontBoldPath);
  
  // Tiêu đề
  doc.font('Roboto-Bold').fontSize(24).text('HÓA ĐƠN', { align: 'center' });
  doc.moveDown(1);

  // Thông tin hóa đơn
  doc.font('Roboto').fontSize(10);
  doc.text(`Số hóa đơn: ${invoice.invoiceNumber}`, 50, 100);
  doc.text(`Ngày lập: ${new Date(invoice.issuedDate).toLocaleDateString('vi-VN')}`, 400, 100);

  // Thông tin khách hàng
  doc.moveDown(1);
  doc.text('Thông tin khách hàng:', 50, 130);
  doc.moveDown(0.5);
  doc.text(`Tên: ${invoice.customer.name}`, 50, doc.y);
  doc.text(`Địa chỉ: ${invoice.customer.address}`, 50, doc.y + 15, { width: 300, align: 'left' });
  doc.text(`Số điện thoại: ${invoice.customer.phone}`, 50, doc.y + 30);

  // Danh sách sản phẩm
  const tableTop = 250;
  const itemCodeX = 50;
  const descriptionX = 100;
  const quantityX = 350;
  const priceX = 400;
  const amountX = 480;

  doc.font('Roboto-Bold');
  doc.text('Mã SP', itemCodeX, tableTop);
  doc.text('Tên sản phẩm', descriptionX, tableTop);
  doc.text('SL', quantityX, tableTop);
  doc.text('Đơn giá', priceX, tableTop);
  doc.text('Thành tiền', amountX, tableTop);

  let y = tableTop + 25;
  doc.font('Roboto');

  invoice.items.forEach((item, index) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
      doc.font('Roboto-Bold');
      doc.text('Mã SP', itemCodeX, y);
      doc.text('Tên sản phẩm', descriptionX, y);
      doc.text('SL', quantityX, y);
      doc.text('Đơn giá', priceX, y);
      doc.text('Thành tiền', amountX, y);
      y += 25;
      doc.font('Roboto');
    }

    const itemCode = item.product._id.toString().slice(-6);
    doc.text(itemCode, itemCodeX, y, { width: 50, align: 'left' });
    doc.text(item.product.name, descriptionX, y, { width: 240, align: 'left' });
    doc.text(item.quantity.toString(), quantityX, y, { width: 30, align: 'center' });
    doc.text(item.price.toLocaleString('vi-VN') + ' đ', priceX, y, { width: 70, align: 'right' });
    doc.text((item.quantity * item.price).toLocaleString('vi-VN') + ' đ', amountX, y, { width: 80, align: 'right' });
    y += 25;
  });

  // Tổng cộng
  doc.font('Roboto-Bold');
  y += 10;
  doc.text('Tổng cộng:', 400, y);
  doc.text(invoice.totalAmount.toLocaleString('vi-VN') + ' đ', amountX, y, { width: 80, align: 'right' });

  // Kiểm tra nếu không đủ chỗ cho phần chân trang, thêm trang mới
  if (y > 700) {
    doc.addPage();
    y = 50;
  }

  // Chân trang
  doc.font('Roboto').fontSize(10);
  doc.text(
    'Cảm ơn quý khách đã mua hàng!',
    50,
    doc.page.height - 50,
    { align: 'center', width: doc.page.width - 100 }
  );

  doc.end();
}

module.exports = { createPurchaseOrderPDF, createReceiptConfirmationPDF, createInvoicePDF };
