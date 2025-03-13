import Category from "./Category";

class CategoryComposite extends Category {
  constructor(id, name, slug) {
    super(id, name, slug);
    this.children = [];
  }

  addChild(category) {
    this.children.push(category);
    category.setParent(this);
  }

  removeChild(category) {
    const index = this.children.indexOf(category);
    if (index !== -1) {
      this.children.splice(index, 1);
      category.setParent(null);
    }
  }

  getChildren() {
    return this.children;
  }

  display() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      type: "composite",
      children: this.children.map((child) => child.display()),
    };
  }
}

export default CategoryComposite;
