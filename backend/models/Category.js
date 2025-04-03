const mongoose = require("mongoose");
const ICategory = require("../interfaces/ICategoryComponent");
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    fullSlug: { type: String, required: true, unique: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    isComposite: { type: Boolean, default: false },
  },
  { timestamps: true }
);
categorySchema.methods.getId = function () {
  return this._id;
};
categorySchema.methods.getName = function () {
  return this.name;
};
categorySchema.methods.getSlug = function () {
  return this.slug;
};
categorySchema.methods.getIsComposite = function () {
  return this.isComposite === true;
};
// Thêm methods cho Composite Pattern
categorySchema.methods.add = async function (childCategory) {
  if (!this.children.includes(childCategory._id)) {
    this.children.push(childCategory._id);
    this.isComposite = true;
    await this.save();
  }
};

categorySchema.methods.remove = async function (childCategory) {
  this.children = this.children.filter((id) => !id.equals(childCategory._id));
  this.isComposite = this.children.length > 0;
  await this.save();
};

categorySchema.methods.getChildren = async function(depth = 1) {
  await this.populate({
      path: 'children',
      populate: depth > 1 ? {
          path: 'children',
          populate: depth > 2 ? 'children' : ''
      } : ''
  });
  return this.children;
};

// Middleware trước khi xóa
categorySchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    // Cập nhật parent nếu có
    if (this.parent) {
      await this.model("Category").findByIdAndUpdate(this.parent, {
        $pull: { children: this._id },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
