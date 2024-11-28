const Category = require('../models/Category');
const Product = require('../models/Product');

exports.createCategory = async (req, res) => {
  try {
    console.log('Received category data:', req.body); // Log để kiểm tra
    const { name, parentId, slug } = req.body;
    
    let newSlug = slug;
    if (!newSlug) {
      newSlug = slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
    }

    // Kiểm tra xem slug đã tồn tại chưa
    const existingCategory = await Category.findOne({ slug: newSlug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Slug đã tồn tại, vui lòng chọn slug khác' });
    }

    const newCategory = new Category({
      name,
      parent: parentId || null,
      slug: newSlug
    });

    // Tạo fullSlug
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (parentCategory) {
        newCategory.fullSlug = `${parentCategory.fullSlug}/${newSlug}`;
      } else {
        return res.status(400).json({ message: 'Danh mục cha không tồn tại' });
      }
    } else {
      newCategory.fullSlug = newSlug;
    }

    await newCategory.save();

    if (parentId) {
      await Category.findByIdAndUpdate(parentId, { $push: { children: newCategory._id } });
    }

    await newCategory.populate('parent');

    console.log('Created category:', newCategory); // Log để kiểm tra
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Lỗi khi tạo danh mục', error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null }).populate({
      path: 'children',
      populate: { path: 'children' }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).populate('children');
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log('Attempting to delete category:', categoryId);

    // Kiểm tra xem danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      console.log('Category not found');
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Kiểm tra xem danh mục có danh mục con không
    const childCategories = await Category.find({ parent: categoryId });
    if (childCategories.length > 0) {
      console.log('Category has child categories');
      return res.status(400).json({ message: 'Không thể xóa danh mục có danh mục con' });
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const productsInCategory = await Product.find({ category: categoryId });
    if (productsInCategory.length > 0) {
      console.log('Category has products');
      return res.status(400).json({ message: 'Không thể xóa danh mục có sản phẩm' });
    }

    // Xóa danh mục
    await Category.findByIdAndDelete(categoryId);
    console.log('Category deleted successfully');
    res.json({ message: 'Danh mục đã được xóa thành công' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa danh mục', error: error.message });
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
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    let path = [];
    while (category) {
      path.unshift({ id: category._id, name: category.name, slug: category.slug });
      category = category.parent;
    }

    res.json(path);
  } catch (error) {
    console.error('Error in getCategoryPath:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
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