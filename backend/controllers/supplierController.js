const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhà cung cấp', error: error.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi tạo nhà cung cấp mới', error: error.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
    res.json(updatedSupplier);
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi cập nhật nhà cung cấp', error: error.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp' });
    }
    res.json({ message: 'Đã xóa nhà cung cấp thành công' });
  } catch (error) {
    res.status(400).json({ message: 'Lỗi khi xóa nhà cung cấp', error: error.message });
  }
};