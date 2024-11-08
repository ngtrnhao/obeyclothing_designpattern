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

  
  const pageHeight = doc.page.height;
  doc.font('Roboto').fontSize(10);
  doc.text('Cảm ơn quý khách đã mua hàng!', {
    align: 'center',
    width: doc.page.width,
    y: pageHeight - 100
  });

  doc.end();
}

function createDeliveryNotePDF(delivery, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  // Đăng ký font
  const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
  const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
  doc.registerFont('Roboto', fontPath);
  doc.registerFont('Roboto-Bold', fontBoldPath);

  // Header
  doc.font('Roboto-Bold').fontSize(24).text('PHIẾU GIAO HÀNG', { align: 'center' });
  doc.moveDown(1);

  // Thông tin phiếu
  doc.font('Roboto').fontSize(12);
  doc.text(`Mã phiếu giao hàng: ${delivery._id}`);
  doc.text(`Mã đơn hàng: ${delivery.order._id}`);
  doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`);
  doc.moveDown();

  // Thông tin người nhận
  doc.font('Roboto-Bold').text('THÔNG TIN NGƯỜI NHẬN:');
  doc.font('Roboto');
  doc.text(`Họ tên: ${delivery.shippingInfo.fullName}`);
  doc.text(`Số điện thoại: ${delivery.shippingInfo.phone}`);
  doc.text('Địa chỉ: ' + [
    delivery.shippingInfo.streetAddress,
    delivery.shippingInfo.wardName,
    delivery.shippingInfo.districtName,
    delivery.shippingInfo.provinceName
  ].filter(Boolean).join(', '));
  doc.moveDown();

  // Chi tiết đơn hàng
  doc.font('Roboto-Bold').text('CHI TIẾT ĐƠN HÀNG:');
  doc.moveDown();

  // Header của bảng
  const tableTop = doc.y;
  doc.font('Roboto-Bold');
  doc.text('STT', 50, tableTop);
  doc.text('Tên sản phẩm', 100, tableTop);
  doc.text('SL', 350, tableTop, { width: 50, align: 'center' });
  doc.text('Ghi chú', 400, tableTop);

  // Kẻ đường line
  doc.moveTo(50, tableTop + 20).lineTo(550, tableTop + 20).stroke();

  // Nội dung bảng
  let y = tableTop + 30;
  doc.font('Roboto');
  
  delivery.order.items.forEach((item, index) => {
    doc.text((index + 1).toString(), 50, y);
    doc.text(item.product.name, 100, y);
    doc.text(item.quantity.toString(), 350, y, { width: 50, align: 'center' });
    doc.text('', 400, y);
    y += 25;
  });

  // Phần chữ ký
  doc.moveDown(4);
  doc.fontSize(11);
  
  doc.text('Người giao hàng', 50, doc.y, { width: 200, align: 'center' });
  doc.moveDown(3);
  doc.text('(Ký và ghi rõ họ tên)', 50, doc.y, { width: 200, align: 'center' });

  const currentY = doc.y - 80;
  doc.text('Người nhận hàng', 350, currentY, { width: 200, align: 'center' });
  doc.moveDown(3);
  doc.text('(Ký và ghi rõ họ tên)', 350, doc.y - 40, { width: 200, align: 'center' });

  doc.end();
}

function createStatisticsReportPDF(stats, period, res) {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    doc.pipe(res);

    // Đăng ký font
    const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);

    // Header
    doc.font('Roboto-Bold').fontSize(24)
       .text('BÁO CÁO THỐNG KÊ', { align: 'center' });
    doc.moveDown();
    
    // Kỳ báo cáo
    doc.font('Roboto').fontSize(12)
       .text(`Kỳ báo cáo: ${period}`, { align: 'center' });
    doc.moveDown(2);

    // 1. Thống kê tổng quan
    doc.font('Roboto-Bold').fontSize(16)
       .text('1. THỐNG KÊ TỔNG QUAN', { underline: true });
    doc.moveDown();
    
    // Box cho thống kê tổng quan
    const stats_y = doc.y;
    doc.font('Roboto').fontSize(12);
    
    // Vẽ boxes cho từng thông số
    const boxWidth = 160;
    const boxHeight = 60;
    const spacing = 20;
    
    // Box 1 - Doanh thu
    doc.rect(50, stats_y, boxWidth, boxHeight).stroke();
    doc.font('Roboto-Bold').fontSize(12)
       .text('Tổng doanh thu', 50, stats_y + 10, { width: boxWidth, align: 'center' });
    doc.font('Roboto').fontSize(11)
       .text(new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue),
             50, stats_y + 30, { width: boxWidth, align: 'center' });

    // Box 2 - Đơn hàng
    doc.rect(50 + boxWidth + spacing, stats_y, boxWidth, boxHeight).stroke();
    doc.font('Roboto-Bold').fontSize(12)
       .text('Tổng đơn hàng', 50 + boxWidth + spacing, stats_y + 10, { width: boxWidth, align: 'center' });
    doc.font('Roboto').fontSize(11)
       .text(stats.totalOrders.toString(),
             50 + boxWidth + spacing, stats_y + 30, { width: boxWidth, align: 'center' });

    // Box 3 - Người dùng
    doc.rect(50 + (boxWidth + spacing) * 2, stats_y, boxWidth, boxHeight).stroke();
    doc.font('Roboto-Bold').fontSize(12)
       .text('Tổng người dùng', 50 + (boxWidth + spacing) * 2, stats_y + 10, { width: boxWidth, align: 'center' });
    doc.font('Roboto').fontSize(11)
       .text(stats.totalUsers.toString(),
             50 + (boxWidth + spacing) * 2, stats_y + 30, { width: boxWidth, align: 'center' });

    doc.moveDown(5);

    // 2. Biểu đồ
    doc.font('Roboto-Bold').fontSize(16)
       .text('2. BIỂU ĐỒ DOANH THU VÀ ĐƠN HÀNG', { underline: true });
    doc.moveDown();

    // Thiết lập biểu đồ
    const pageWidth = doc.page.width - 2 * doc.page.margins.left;
    const chartWidth = pageWidth * 0.85;
    const chartHeight = 200;
    const chartMargin = 70;
    const chartStart = doc.y + 20;

    // Vẽ khung biểu đồ
    doc.rect(chartMargin - 10, chartStart - 10, 
             chartWidth + 20, chartHeight + 40)
       .stroke();

    // Vẽ trục tọa độ
    doc.strokeColor('#000000');
    doc.lineWidth(1);
    // Trục x
    doc.moveTo(chartMargin, chartStart + chartHeight)
       .lineTo(chartMargin + chartWidth, chartStart + chartHeight)
       .stroke();
    // Trục y
    doc.moveTo(chartMargin, chartStart)
       .lineTo(chartMargin, chartStart + chartHeight)
       .stroke();

    // Vẽ biểu đồ doanh số
    if (stats.salesData && stats.salesData.length > 0) {
      const maxRevenue = Math.max(...stats.salesData.map(d => Number(d.revenue) || 0));
      const xStep = chartWidth / Math.max(stats.salesData.length - 1, 1);
      const yScale = maxRevenue > 0 ? chartHeight / maxRevenue : 0;

      // Vẽ đường doanh số
      doc.strokeColor('#1E88E5');
      let isFirstValidPoint = true;
      stats.salesData.forEach((data, i) => {
        const x = chartMargin + i * xStep;
        const revenue = Number(data.revenue) || 0;
        const y = chartStart + chartHeight - (revenue * yScale);

        if (!isNaN(x) && !isNaN(y)) {
          if (isFirstValidPoint) {
            doc.moveTo(x, y);
            isFirstValidPoint = false;
          } else {
            doc.lineTo(x, y);
          }
        }
      });
      doc.stroke();

      // Vẽ nhãn trục x
      doc.font('Roboto').fontSize(8);
      stats.salesData.forEach((data, i) => {
        const x = chartMargin + i * xStep;
        doc.text(
          data.date,
          x - 20,
          chartStart + chartHeight + 10, // Tăng khoảng cách với trục x
          { width: 40, align: 'center' }
        );
      });

      // Vẽ nhãn trục y
      const ySteps = 5;
      doc.fontSize(8);
      for (let i = 0; i <= ySteps; i++) {
        const value = (maxRevenue * i / ySteps);
        const y = chartStart + chartHeight - (chartHeight * i / ySteps);
        doc.text(
          `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}`,
          5,
          y - 4, // Điều chỉnh vị trí để căn giữa với điểm trên trục
          { width: 50, align: 'right' }
        );
      }
    } else {
      doc.font('Roboto').fontSize(12)
         .text('Không có dữ liệu cho khoảng thời gian này', chartMargin, chartStart + chartHeight/2);
    }

    // Tăng khoảng cách trước phần 3
    doc.moveDown(15); // Tăng từ 8 lên 15

    // Kiểm tra nếu cần thêm trang mới
    if (doc.y > doc.page.height - 300) { // Nếu không đủ khoảng trống cho phần 3
      doc.addPage(); // Thêm trang mới
    }

    // 3. Top sản phẩm
    doc.font('Roboto-Bold').fontSize(16)
       .text('3. TOP SẢN PHẨM BÁN CHẠY', { underline: true });
    doc.moveDown();

    if (stats.topProducts && stats.topProducts.length > 0) {
      // Reset vị trí y sau khi thêm trang mới nếu cần
      const tableTop = doc.y;
      const fullWidth = 500;
      const colWidths = [250, 100, 150];
      const rowHeight = 35;
      
      // Header của bảng
      doc.fillColor('#f5f5f5')
         .rect(50, tableTop, fullWidth, rowHeight)
         .fill();
      
      doc.strokeColor('#000000')
         .rect(50, tableTop, fullWidth, rowHeight)
         .stroke();
      
      // Header text
      doc.fillColor('#000000')
         .font('Roboto-Bold').fontSize(11);
      doc.text('Tên sản phẩm', 60, tableTop + 12);
      doc.text('Số lượng', 60 + colWidths[0], tableTop + 12);
      doc.text('Doanh thu', 60 + colWidths[0] + colWidths[1], tableTop + 12);

      // Dữ liệu bảng
      doc.font('Roboto').fontSize(10);
      stats.topProducts.forEach((product, index) => {
        const y = tableTop + rowHeight * (index + 1);
        
        // Vẽ viền cho từng hàng
        doc.rect(50, y, fullWidth, rowHeight).stroke();
        
        // Vẽ viền cho từng ô
        doc.rect(50, y, colWidths[0], rowHeight).stroke();
        doc.rect(50 + colWidths[0], y, colWidths[1], rowHeight).stroke();
        doc.rect(50 + colWidths[0] + colWidths[1], y, colWidths[2], rowHeight).stroke();
        
        // Nội dung từng ô
        doc.text(product.name, 60, y + 12, { width: colWidths[0] - 20 });
        doc.text(product.soldQuantity.toString(), 60 + colWidths[0], y + 12, 
                { width: colWidths[1] - 10, align: 'center' });
        doc.text(
          new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(product.revenue),
          60 + colWidths[0] + colWidths[1], 
          y + 12,
          { width: colWidths[2] - 20, align: 'right' }
        );
      });
    }

    // Chữ ký
    doc.moveDown(6);
    doc.font('Roboto').fontSize(11);
    doc.text('Người lập báo cáo', 350, doc.y, { width: 200, align: 'center' });
    doc.moveDown(3);
    doc.text('(Ký và ghi rõ họ tên)', 350, doc.y, { width: 200, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error in createStatisticsReportPDF:', error);
    throw error;
  }
}

module.exports = {
  createPurchaseOrderPDF,
  createInvoicePDF,
  createDeliveryNotePDF,
  createStatisticsReportPDF
};
