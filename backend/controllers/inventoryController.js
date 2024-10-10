const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Notification = require('../models/Notification'); // Create this model if not exists
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Supplier = require('../models/Supplier'); // Added import for Supplier model
const path = require('path');

exports.checkLowStock = async () => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    for (let product of lowStockProducts) {
      const existingOrder = await PurchaseOrder.findOne({
        product: product._id,
        status: { $in: ['pending', 'approved'] }
      });

      if (!existingOrder) {
        const newOrder = new PurchaseOrder({
          product: product._id,
          suggestedQuantity: product.lowStockThreshold * 2 - product.stock
        });
        await newOrder.save();

        const newNotification = new Notification({
          type: 'low_stock',
          message: `Product ${product.name} is low on stock. Please consider restocking.`,
          relatedModel: 'PurchaseOrder',
          relatedId: newOrder._id
        });
        await newNotification.save();

        console.log(`Created purchase order request for ${product.name}`);
      }
    }
  } catch (error) {
    console.error('Error checking low stock:', error);
  }
};

exports.getPurchaseOrders = async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().populate('product');
    res.json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching purchase orders', error: error.message });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualQuantity, notes } = req.body;
    const updatedOrder = await PurchaseOrder.findByIdAndUpdate(id, 
      { status, actualQuantity, notes, orderDate: status === 'approved' ? Date.now() : undefined },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating purchase order', error: error.message });
  }
};

exports.generatePurchaseOrderPDF = async (req, res) => {
  console.log('generatePurchaseOrderPDF function called');
  try {
    const { id } = req.params;
    console.log('Purchase order ID:', id);
    
    const purchaseOrder = await PurchaseOrder.findById(id).populate('product supplier');
    
    if (!purchaseOrder) {
      console.log('Purchase order not found');
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }
    
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Thiết lập response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-order-${id}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);

    // Đăng ký và sử dụng font Roboto
    const fontPath = path.join(__dirname, '../fonts/Roboto-Regular.ttf');
    const fontBoldPath = path.join(__dirname, '../fonts/Roboto-Bold.ttf');
    doc.registerFont('Roboto', fontPath);
    doc.registerFont('Roboto-Bold', fontBoldPath);
    
    doc.font('Roboto');

    // Add header
    doc.font('Roboto-Bold').fontSize(24).text('PHIẾU NHẬP HÀNG', { align: 'center' });
    doc.moveDown(2);

    // Add purchase order details
    doc.font('Roboto').fontSize(12);
    doc.text(`Mã đơn: ${purchaseOrder._id}`);
    doc.text(`Ngày đặt hàng: ${purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString('vi-VN') : 'Chưa có'}`);
    doc.moveDown();

    doc.text(`Sản phẩm: ${purchaseOrder.product ? purchaseOrder.product.name : 'N/A'}`);
    doc.text(`Nhà cung cấp: ${purchaseOrder.supplier ? purchaseOrder.supplier.name : 'N/A'}`);
    doc.text(`Số lượng đề xuất: ${purchaseOrder.suggestedQuantity}`);
    doc.text(`Trạng thái: ${purchaseOrder.status}`);
    doc.moveDown();

    doc.text(`Ghi chú: ${purchaseOrder.notes || 'Không có'}`);

    // Add footer
    doc.fontSize(10);
    doc.text(
      `Tạo bởi: ${req.user ? req.user.name : 'Hệ thống'} | Ngày tạo: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`,
      { align: 'center' }
    );

    // Finalize the PDF and end the stream
    doc.end();

    console.log('PDF generation completed');
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ message: 'Lỗi khi tạo PDF', error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    await product.updateStock(quantity);
    
    // Kiểm tra hàng tồn kho ngay sau khi cập nhật
    if (product.stock <= product.lowStockThreshold) {
      await checkLowStockForProduct(product);
    }
    
    res.json({ message: 'Cập nhật số lượng tồn kho thành công', stock: product.stock });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const checkLowStockForProduct = async (product) => {
  // Logic kiểm tra và tạo đơn đặt hàng cho sản phẩm cụ thể
  // (Tương tự như trong hàm checkLowStock, nhưng chỉ cho một sản phẩm)
};

exports.manualCheckLowStock = async (req, res) => {
  try {
    await checkLowStock();
    res.json({ message: 'Kiểm tra hàng tồn kho thấp đã được thực hiện' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra hàng tồn kho', error: error.message });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { product, suggestedQuantity, supplier } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!product || !suggestedQuantity || !supplier) {
      return res.status(400).json({ message: 'Thiếu các trường bắt buộc', 
        details: { product, suggestedQuantity, supplier } });
    }

    // Kiểm tra xem product và supplier có tồn tại không
    const productExists = await Product.findById(product);
    const supplierExists = await Supplier.findById(supplier);

    if (!productExists) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại' });
    }

    if (!supplierExists) {
      return res.status(400).json({ message: 'Nhà cung cấp không tồn tại' });
    }

    const newPurchaseOrder = new PurchaseOrder({
      product,
      suggestedQuantity,
      supplier,
      status: 'pending'
    });

    // Lưu đơn đặt hàng
    await newPurchaseOrder.save();

    res.status(201).json({ message: 'Đơn đặt hàng đã được tạo', purchaseOrder: newPurchaseOrder });
  } catch (error) {
    console.error('Lỗi khi tạo đơn đặt hàng:', error);
    res.status(500).json({ message: 'Lỗi khi tạo đơn đặt hàng', error: error.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });
    res.json(lowStockProducts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm tồn kho thấp', error: error.message });
  }
};