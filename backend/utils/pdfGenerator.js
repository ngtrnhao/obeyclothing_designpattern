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
  doc.moveDown(2);
  doc.text('Thông tin khách hàng:', 50, 140);
  doc.text(`Tên: ${invoice.customer.name}`, 50, 160);
  doc.text(`Địa chỉ: ${invoice.customer.address}`, 50, 180, { width: 300 });
  doc.text(`Số điện thoại: ${invoice.customer.phone}`, 50, 200);

  // Phương thức thanh toán - Đặt sang phải
  const paymentMethodText = {
    cod: 'Thanh toán khi nhận hàng',
    paypal: 'PayPal',
    banking: 'Chuyển khoản ngân hàng'
  };
  doc.text(`Phương thức thanh toán: ${paymentMethodText[invoice.paymentMethod] || invoice.paymentMethod}`, 400, 160);

  // Đường kẻ phân cách
  doc.moveTo(50, 240).lineTo(550, 240).stroke();

  // Bảng sản phẩm - Header
  const tableTop = 260;
  doc.font('Roboto-Bold');

  // Định nghĩa cột với khoảng cách rõ ràng
  doc.text('Mã SP', 50, tableTop, { width: 80 });
  doc.text('Tên sản phẩm', 130, tableTop, { width: 200 });
  doc.text('SL', 350, tableTop, { width: 30, align: 'center' });
  doc.text('Đơn giá', 400, tableTop, { width: 80, align: 'right' });
  doc.text('Thành tiền', 500, tableTop, { width: 80, align: 'right' });

  // Đường kẻ dưới header
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

  // Danh sách sản phẩm
  let y = tableTop + 30;
  doc.font('Roboto');

  invoice.items.forEach((item) => {
    const itemCode = item.product._id.toString().slice(-6);
    doc.text(itemCode, 50, y, { width: 80 });
    doc.text(item.product.name, 130, y, { width: 200 });
    doc.text(item.quantity.toString(), 350, y, { width: 30, align: 'center' });
    doc.text(item.price.toLocaleString('vi-VN') + ' đ', 400, y, { width: 80, align: 'right' });
    doc.text((item.quantity * item.price).toLocaleString('vi-VN') + ' đ', 500, y, { width: 80, align: 'right' });
    y += 25;
  });

  // Tính tổng tiền hàng trước khi sử dụng
  const subtotal = invoice.items.reduce((total, item) => 
    total + (item.quantity * item.price), 0
  );

  // Phần tổng tiền
  y += 30;
  doc.text('Tổng tiền hàng:', 400, y);
  doc.text(subtotal.toLocaleString('vi-VN') + ' đ', 500, y, { width: 80, align: 'right' });

  // Phí vận chuyển
  y += 25;
  doc.text('Phí vận chuyển:', 400, y);
  doc.text(invoice.shippingFee.toLocaleString('vi-VN') + ' đ', 500, y, { width: 80, align: 'right' });

  // Giảm giá
  y += 25;
  doc.text('Giảm giá:', 400, y);
  doc.text('-' + invoice.discountAmount.toLocaleString('vi-VN') + ' đ', 500, y, { width: 80, align: 'right' });

  // Tổng thanh toán
  y += 25;
  doc.font('Roboto-Bold');
  doc.text('Tổng thanh toán:', 400, y);
  doc.text(invoice.finalAmount.toLocaleString('vi-VN') + ' đ', 500, y, { width: 80, align: 'right' });

  // Dòng cảm ơn - Đặt ở cuối trang với khoảng cách phù hợp
  const pageHeight = doc.page.height;
  doc.font('Roboto').fontSize(10);
  doc.text('Cảm ơn quý khách đã mua hàng!', {
    align: 'center',
    width: doc.page.width,
    y: pageHeight - 100
  });

  doc.end();
}

module.exports = { createPurchaseOrderPDF, createReceiptConfirmationPDF, createInvoicePDF };
