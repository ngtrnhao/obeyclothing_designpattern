const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Notification = require('../models/Notification'); // Create this model if not exists
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Supplier = require('../models/Supplier'); // Added import for Supplier model
const path = require('path');
const { createPurchaseOrderPDF, createReceiptConfirmationPDF } = require('../utils/pdfGenerator');

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

    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }

    purchaseOrder.status = status;
    if (actualQuantity) purchaseOrder.actualQuantity = actualQuantity;
    if (notes) purchaseOrder.notes = notes;

    await purchaseOrder.save();

    res.json({ message: 'Đã cập nhật đơn đặt hàng', purchaseOrder });
  } catch (error) {
    console.error('Lỗi khi cập nhật đơn đặt hàng:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật đơn đặt hàng', error: error.message });
  }
};

exports.generatePurchaseOrderPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id).populate('product supplier');
    
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-order-${id}.pdf`);
    
    createPurchaseOrderPDF(purchaseOrder, res, req.user.name);
  } catch (error) {
    console.error('Lỗi khi tạo PDF đơn đặt hàng:', error);
    res.status(500).json({ message: 'Lỗi khi tạo PDF đơn đặt hàng', error: error.message });
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

exports.confirmReceiptAndUpdateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualQuantity } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(id).populate('product');
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng' });
    }

    if (purchaseOrder.status !== 'approved') {
      return res.status(400).json({ message: 'Đơn đặt hàng chưa được phê duyệt' });
    }

    if (actualQuantity > purchaseOrder.suggestedQuantity) {
      return res.status(400).json({ 
        message: `Số lượng thực nhận (${actualQuantity}) không thể lớn hơn số lượng đề xuất (${purchaseOrder.suggestedQuantity})`
      });
    }

    purchaseOrder.actualQuantity = actualQuantity;
    purchaseOrder.receiptDate = new Date();
    purchaseOrder.status = 'received';

    await purchaseOrder.save();

    // Update product inventory
    const product = purchaseOrder.product;
    product.stock += actualQuantity;
    await product.save();

    res.json({ message: 'Đã xác nhận nhận hàng và cập nhật tồn kho', purchaseOrder });
  } catch (error) {
    console.error('Error confirming receipt and updating inventory:', error);
    res.status(500).json({ message: 'Lỗi khi xác nhận nhận hàng và cập nhật tồn kho', error: error.message });
  }
};

exports.generateReceiptConfirmationPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseOrder = await PurchaseOrder.findById(id).populate('product supplier');
    
    if (!purchaseOrder || purchaseOrder.status !== 'received') {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt hàng đã nhập kho' });
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-confirmation-${id}.pdf`);
    
    const userName = req.user ? req.user.fullName : 'Không xác định';
    const currentDate = new Date().toLocaleDateString('vi-VN');
    
    createReceiptConfirmationPDF(purchaseOrder, res, userName, currentDate);
  } catch (error) {
    console.error('Lỗi khi tạo PDF phiếu nhập kho:', error);
    res.status(500).json({ message: 'Lỗi khi tạo PDF phiếu nhập kho', error: error.message });
  }
};
