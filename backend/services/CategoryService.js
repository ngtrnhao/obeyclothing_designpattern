const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('slugify');
const mongoose = require('mongoose');

class CategoryService {
  async createCategory(categoryData) {
    try {
      const { name, parentId, slug } = categoryData;
      
      // Tạo slug nếu không được cung cấp
      let newSlug = slug || slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });
      
      // Kiểm tra slug tồn tại
      const existingCategory = await Category.findOne({ slug: newSlug });
      if (existingCategory) {
        throw new Error('Slug đã tồn tại, vui lòng chọn slug khác');
      }

      // Tạo category mới
      const newCategory = new Category({
        name,
        slug: newSlug,
        parent: parentId || null
      });

      // Xử lý fullSlug và parent
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          throw new Error('Danh mục cha không tồn tại');
        }
        newCategory.fullSlug = `${parentCategory.fullSlug}/${newSlug}`;
        
        // Cập nhật parent category
        parentCategory.children.push(newCategory._id);
        parentCategory.isComposite = true;
        await parentCategory.save();
      } else {
        newCategory.fullSlug = newSlug;
      }

      await newCategory.save();
      return await Category.findById(newCategory._id).populate('parent');
    } catch (error) {
      throw error;
    }
  }

  async getCategoryTree() {
    try {
      const categories = await Category.find({ parent: null })
        .populate({
          path: 'children',
          populate: { 
            path: 'children',
            populate: 'children'
          }
        });
      return categories;
    } catch (error) {
      throw error;
    }
  }

  async deleteCategory(categoryId) {
    try {
      // Kiểm tra categoryId có hợp lệ không
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error('ID danh mục không hợp lệ');
      }

      // Tìm category
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      // Kiểm tra có danh mục con không
      const hasChildren = await Category.exists({ parent: categoryId });
      if (hasChildren) {
        throw new Error('Không thể xóa danh mục có danh mục con');
      }

      // Kiểm tra có sản phẩm không
      const hasProducts = await Product.exists({ category: categoryId });
      if (hasProducts) {
        throw new Error('Không thể xóa danh mục có sản phẩm');
      }

      // Nếu có parent, cập nhật parent
      if (category.parent) {
        await Category.findByIdAndUpdate(
          category.parent,
          { $pull: { children: categoryId } }
        );
      }

      // Xóa category
      await Category.findByIdAndDelete(categoryId);
      
      return { success: true, message: 'Xóa danh mục thành công' };
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug) {
    try {
      const category = await Category.findOne({ slug }).populate('children');
      if (!category) {
        throw new Error('Không tìm thấy danh mục');
      }
      return category;
    } catch (error) {
      throw error;
    }
  }

  async getAllChildCategories(categoryId) {
    try {
      const children = await Category.find({ parent: categoryId });
      let allChildren = [...children];
      
      for (let child of children) {
        const grandChildren = await this.getAllChildCategories(child._id);
        allChildren = allChildren.concat(grandChildren);
      }
      
      return allChildren;
    } catch (error) {
      throw error;
    }
  }

  async getCategoryPath(categoryId) {
    try {
      let category = await Category.findById(categoryId).populate('parent');
      if (!category) {
        throw new Error('Không tìm thấy danh mục');
      }

      let path = [];
      while (category) {
        path.unshift({
          id: category._id,
          name: category.name,
          slug: category.slug
        });
        category = category.parent;
      }
      
      return path;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CategoryService();
      