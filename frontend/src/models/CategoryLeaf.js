import Category from "./Category";

class CategoryLeaf extends Category {
  display() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      type: "leaf",
    };
  }
}

export default CategoryLeaf;
