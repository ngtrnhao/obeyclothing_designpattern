const Invoice = require('../models/Invoice');
const Order = require('../models/Order');
const { createInvoicePDF } = require('../utils/pdfGenerator');

// Tạo hóa đơn từ đơn hàng
exports.createInvoiceFromOrder = async (order) => {
  try {
    // Tạo số hóa đơn duy nhất
    const invoiceNumber = `INV-${Date.now()}`;

    // Xử lý địa chỉ giao hàng
    const shippingAddress = order.shippingInfo ? 
      `${order.shippingInfo.streetAddress}, ${order.shippingInfo.wardName}, ${order.shippingInfo.districtName}, ${order.shippingInfo.provinceName}`
        .replace(/,\s*,/g, ',')
        .replace(/^,\s*/, '')
        .trim() : '';

    // Log để debug
    console.log('ShippingInfo from order:', order.shippingInfo);
    console.log('Formatted shipping address:', shippingAddress);

    const newInvoice = new Invoice({
      order: order._id,
      customer: {
        name: order.shippingInfo?.fullName || '',
        address: shippingAddress,
        phone: order.shippingInfo?.phone || ''
      },
      items: order.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      })),
      totalAmount: order.totalAmount,
      invoiceNumber: invoiceNumber,
      shippingFee: order.shippingFee || 30000,
      voucher: order.voucher || null,
      discountAmount: order.discountAmount || 0,
      finalAmount: order.finalAmount,
      status: 'issued',
      paymentMethod: order.paymentMethod
    });

    console.log('Invoice data before saving:', {
      ...newInvoice.toObject(),
      shippingFee: newInvoice.shippingFee,
      voucher: newInvoice.voucher
    });

    await newInvoice.save();

    // Cập nhật order với ID hóa đơn
    order.invoice = newInvoice._id;
    await order.save();

    return newInvoice;
  } catch (error) {
    console.error('Lỗi khi tạo hóa đơn:', error);
    throw error;
  }
};

// Lấy thông tin hóa đơn
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'order',
        populate: {
          path: 'user',
          select: 'username email'
        }
      })
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && invoice.order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập hóa đơn này' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Tải xuống hóa đơn PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('order')
      .populate('items.product');

    if (!invoice) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && invoice.order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Không có quyền truy cập hóa đơn này' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

    createInvoicePDF(invoice, res);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo PDF hóa đơn', error: error.message });
  }
};