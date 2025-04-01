const Category = require("../models/Category");
const Product = require("../models/Product");
const slugify = require("slugify");
const mongoose = require("mongoose");

class CategoryService {
  async createCategory(categoryData) {
    try {
      const { name, parentId, slug } = categoryData;

      // Tạo slug nếu không được cung cấp
      let newSlug =
        slug || slugify(name, { lower: true, remove: /[*+~.()'"!:@]/g });

      // Kiểm tra slug tồn tại
      const existingCategory = await Category.findOne({ slug: newSlug });
      if (existingCategory) {
        throw new Error("Slug đã tồn tại, vui lòng chọn slug khác");
      }

      // Tạo category mới
      const newCategory = new Category({
        name,
        slug: newSlug,
        parent: parentId || null,
      });

      // Xử lý fullSlug và parent
      if (parentId) {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          throw new Error("Danh mục cha không tồn tại");
        }
        newCategory.fullSlug = `${parentCategory.fullSlug}/${newSlug}`;

        // Sử dụng phương thức Composite Pattern
        await parentCategory.add(newCategory);
      } else {
        newCategory.fullSlug = newSlug;
      }

      await newCategory.save();
      return await Category.findById(newCategory._id).populate("parent");
    } catch (error) {
      throw error;
    }
  }

  async getCategoryTree() {
    try {
      const categories = await Category.find({ parent: null }).populate({
        path: "children",
        populate: {
          path: "children",
          populate: "children",
        },
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
        throw new Error("ID danh mục không hợp lệ");
      }

      // Tìm category
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error("Danh mục không tồn tại");
      }

      // Kiểm tra có danh mục con không
      const hasChildren = category.isComposite;
      if (hasChildren) {
        throw new Error("Không thể xóa danh mục có danh mục con");
      }

      // Kiểm tra có sản phẩm không
      const hasProducts = await Product.exists({ category: categoryId });
      if (hasProducts) {
        throw new Error("Không thể xóa danh mục có sản phẩm");
      }

      // Nếu có parent, cập nhật parent bằng Composite Pattern
      if (category.parent) {
        const parentCategory = await Category.findById(category.parent);
        if (parentCategory) {
          await parentCategory.remove(category);
        }
      }

      // Xóa category
      await Category.findByIdAndDelete(categoryId);

      return { success: true, message: "Xóa danh mục thành công" };
    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
  }

  // async getCategoryBySlug(slug) {
  //   try {
  //     const category = await Category.findOne({ slug }).populate("children");
  //     if (!category) {
  //       throw new Error("Không tìm thấy danh mục");
  //     }
  //     return category;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getCategoryBySlugOrId(slugOrId) {
  //   try {
  //     let category;
  //     if (mongoose.Types.ObjectId.isValid(slugOrId)) {
  //       category = await Category.findById(slugOrId).populate("children");
  //     } else {
  //       category = await Category.findOne({ slug: slugOrId }).populate(
  //         "children"
  //       );
  //     }

  //     if (!category) {
  //       throw new Error("Không tìm thấy danh mục");
  //     }
  //     return category;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async getCategoryPath(categoryId) {
    try {
      let category = await Category.findById(categoryId).populate("parent");
      if (!category) {
        throw new Error("Không tìm thấy danh mục");
      }

      let path = [];
      while (category) {
        path.unshift({
          id: category._id,
          name: category.name,
          slug: category.slug,
        });
        category = category.parent;
      }

      return path;
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

  async getProductsByCategory(categoryIdOrSlug, includeChildren = true) {
    try {
      // Tìm category theo ID hoặc slug
      let category;
      if (mongoose.Types.ObjectId.isValid(categoryIdOrSlug)) {
        category = await Category.findById(categoryIdOrSlug);
      } else {
        category = await Category.findOne({ slug: categoryIdOrSlug });
      }

      if (!category) {
        throw new Error("Không tìm thấy danh mục");
      }

      // Xác định các danh mục cần tìm sản phẩm
      let categoryIds = [category._id];

      // Nếu bao gồm con, lấy tất cả ID danh mục con
      if (includeChildren) {
        const childCategories = await this.getAllChildCategories(category._id);
        if (childCategories.length > 0) {
          categoryIds = [...categoryIds, ...childCategories.map((c) => c._id)];
        }
      }

      // Tìm sản phẩm trong các danh mục
      const products = await Product.find({ category: { $in: categoryIds } });
      return products;
    } catch (error) {
      throw error;
    }
  }
}

//   async getSubcategories(parentId) {
//     try {
//       const category = await Category.findById(parentId);
//       if (!category) {
//         throw new Error("Không tìm thấy danh mục cha");
//       }

//       // Sử dụng phương thức getChildren của Composite Pattern
//       return await category.getChildren();
//     } catch (error) {
//       throw error;
//     }
//   }
// }

module.exports = new CategoryService();
