const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent').lean();
    const structuredCategories = structureCategories(categories);
    res.json(structuredCategories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    let parent = null;
    let level = 0;

    if (parentId) {
      parent = await Category.findById(parentId);
      if (!parent) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục cha' });
      }
      level = parent.level + 1;
    }

    const newCategory = new Category({ 
      name, 
      parent: parentId || null, 
      level 
    });

    await newCategory.save();

    // Nếu có danh mục cha, cập nhật danh sách con của nó
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(newCategory._id);
      await parent.save();
    }

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Dữ liệu không hợp lệ', error: error.message });
    }
    res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Xóa tất cả danh mục con
    await Category.deleteMany({ parent: categoryId });

    // Xóa danh mục hiện tại
    await Category.findByIdAndDelete(categoryId);

    // Cập nhật sản phẩm
    await Product.updateMany({ category: category.name }, { $unset: { category: 1 } });

    res.json({ message: 'Danh mục đã được xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa danh mục', error: error.message });
  }
};

function structureCategories(categories) {
  const categoryMap = {};
  const rootCategories = [];

  categories.forEach(category => {
    category.children = [];
    categoryMap[category._id] = category;
  });

  categories.forEach(category => {
    if (category.parent) {
      const parent = categoryMap[category.parent._id];
      if (parent) {
        parent.children.push(category);
      }
    } else {
      rootCategories.push(category);
    }
  });

  return rootCategories;
}

exports.getCategoryPath = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    let category = await Category.findById(categoryId).populate('parent');
    let path = [];

    while (category) {
      path.unshift({ id: category._id, name: category.name });
      category = category.parent;
    }

    res.json({ path });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy đường dẫn danh mục', error: error.message });
  }
};