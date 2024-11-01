const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number,
    min: 0
  },
  minPurchase: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

voucherSchema.methods = {
  isValid() {
    const now = new Date();
    return (
      this.isActive &&
      this.startDate <= now &&
      this.endDate >= now &&
      this.usageCount < this.usageLimit
    );
  },

  hasUserUsed(userId) {
    return this.usedBy.some(usage => 
      usage.user.toString() === userId.toString()
    );
  },

  canApplyToCart(cart) {
    // Kiểm tra giá trị đơn hàng tối thiểu
    const cartTotal = cart.items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    if (cartTotal < this.minPurchase) {
      return {
        valid: false,
        message: `Giá trị đơn hàng tối thiểu là ${this.minPurchase.toLocaleString('vi-VN')}đ`
      };
    }

    // Kiểm tra danh mục sản phẩm áp dụng
    if (this.applicableCategories?.length > 0) {
      const hasValidProduct = cart.items.some(item =>
        this.applicableCategories.includes(item.product.category)
      );
      
      if (!hasValidProduct) {
        return {
          valid: false,
          message: 'Voucher không áp dụng cho các sản phẩm trong giỏ hàng'
        };
      }
    }

    return { valid: true };
  },

  calculateDiscount(totalAmount) {
    let discount = 0;
    if (this.discountType === 'percentage') {
      discount = totalAmount * (this.discountValue / 100);
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
    } else {
      discount = Math.min(this.discountValue, totalAmount);
    }
    return discount;
  }
};

module.exports = mongoose.model('Voucher', voucherSchema);
