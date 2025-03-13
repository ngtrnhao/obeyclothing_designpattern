class Category {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.parent = null;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getSlug() {
    return this.slug;
  }

  getParent() {
    return this.parent;
  }

  setParent(parent) {
    this.parent = parent;
  }

  display() {
    throw new Error("Phương thức display() phải được implement");
  }
}

export default Category;
