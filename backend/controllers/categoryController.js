const Category = require('../models/Category');
const Product = require('../models/Product');
const CategoryService = require('../services/CategoryService');

exports.createCategory = async (req, res) => {
  try {
    const category = await CategoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ 
      message: error.message || 'Lỗi khi tạo danh mục'
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryService.getCategoryTree();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ 
      message: error.message || 'Lỗi khi lấy danh sách danh mục'
    });
  }
};

exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await CategoryService.getCategoryBySlug(req.params.slug);
    res.json(category);
  } catch (error) {
    res.status(404).json({ 
      message: error.message || 'Không tìm thấy danh mục'
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log('Deleting category with ID:', categoryId);

    if (!categoryId) {
      throw new Error('Thiếu ID danh mục');
    }

    const result = await CategoryService.deleteCategory(categoryId);
    res.json(result);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Lỗi khi xóa danh mục'
    });
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
    const path = await CategoryService.getCategoryPath(req.params.categoryId);
    res.json(path);
  } catch (error) {
    res.status(404).json({ 
      message: error.message || 'Không tìm thấy đường dẫn danh mục'
    });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const parentId = req.params.categoryId;
    const subcategories = await Category.find({ parent: parentId });
    res.json(subcategories);
  } catch (error) {
    console.error('Error in getSubcategories:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getCategoryBySlugOrId = async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let category;

    if (mongoose.Types.ObjectId.isValid(slugOrId)) {
      category = await Category.findById(slugOrId);
    } else {
      category = await Category.findOne({ slug: slugOrId });
    }

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error in getCategoryBySlugOrId:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getProductsByCategorySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let categoryIds;

    if (slug === 'all') {
      const allCategories = await Category.find();
      categoryIds = allCategories.map(cat => cat._id);
    } else {
      const category = await Category.findOne({ slug });
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      const subcategories = await getAllChildCategories(category._id);
      categoryIds = [category._id, ...subcategories.map(sub => sub._id)];
    }

    const products = await Product.find({ category: { $in: categoryIds } });
    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategorySlug:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Helper function to get all child categories
async function getAllChildCategories(categoryId) {
  const children = await Category.find({ parent: categoryId });
  let allChildren = [...children];
  for (let child of children) {
    const grandChildren = await getAllChildCategories(child._id);
    allChildren = allChildren.concat(grandChildren);
  }
  return allChildren;
}

exports.getProductsByCategoryAndChildren = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const childCategories = await Category.find({ ancestors: categoryId });
    const categoryIds = [categoryId, ...childCategories.map(cat => cat._id)];
    
    const products = await Product.find({ category: { $in: categoryIds } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Thêm hàm mới này vào cuối file
exports.getCategoryByFullSlug = async (req, res) => {
  try {
    const fullSlug = req.params[0];
    const category = await Category.findOne({ fullSlug }).populate('children');
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};