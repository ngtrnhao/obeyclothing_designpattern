const mongoose = require('mongoose');
const DeliveryStateFactory = require('../factories/DeliveryStateFactory');

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippingInfo: { 
    fullName: String,
    phone: String,
    streetAddress: String,
    provinceCode: String,
    districtCode: String,
    wardCode: String,
    provinceName: String,
    districtName: String,
    wardName: String
  },
  status: {
    type: String,
    enum: ['pending', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingStartedAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  }
}, { timestamps: true });

// Khởi tạo state
deliverySchema.methods.initializeState = function() {
  if (!this.state) {
    this.state = DeliveryStateFactory.createState(this.status, this);
  }
};

// Phương thức thay đổi trạng thái
deliverySchema.methods.changeState = async function(newStatus) {
  try {
    // Xác định action cần thực hiện dựa trên trạng thái mới
    let baseAction;
    switch (newStatus) {
      case 'pending': baseAction = 'pending'; break;
      case 'shipping': baseAction = 'shipping'; break;
      case 'delivered': baseAction = 'deliver'; break;
      case 'cancelled': baseAction = 'cancel'; break;
      default: throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
    }

    // Kiểm tra khả năng chuyển trạng thái
    const canChangeMethod = `can${baseAction.charAt(0).toUpperCase() + baseAction.slice(1)}`;
    
    if (typeof this.state[canChangeMethod] !== 'function' || 
        this.state[canChangeMethod]() === false) {
      throw new Error(`Không thể chuyển từ trạng thái ${this.state.getName()} sang ${newStatus}`);
    }
    
    // Thực hiện hành động chuyển trạng thái
    const actionMethod = baseAction;
    const result = await this.state[actionMethod]();
    
    // Cập nhật timestamp tương ứng
    if (newStatus === 'shipping' && !this.shippingStartedAt) {
      this.shippingStartedAt = new Date();
    } else if (newStatus === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    } else if (newStatus === 'cancelled' && !this.cancelledAt) {
      this.cancelledAt = new Date();
    }
    
    // Cập nhật trạng thái và tạo state mới
    this.status = newStatus;
    this.state = DeliveryStateFactory.createState(newStatus, this);
    await this.save();

    return {
      success: true,
      message: result
    };
  } catch (error) {
    return {
      success: false,
      message: `Lỗi khi thay đổi trạng thái: ${error.message}`
    };
  }
};

// Các phương thức xử lý trạng thái 
deliverySchema.methods.processPending = function() {
  return this.state.pending();
};

deliverySchema.methods.startShipping = function() {
  return this.state.shipping();
};

deliverySchema.methods.completeDelivery = function() {
  return this.state.deliver();
};

deliverySchema.methods.cancelDelivery = function() {
  return this.state.cancel();
};

// Middleware để khởi tạo state
deliverySchema.post("init", function() {
  this.initializeState();
});

deliverySchema.post("save", function() {
  if (!this.state) {
    this.initializeState();
  }
});

module.exports = mongoose.model('Delivery', deliverySchema);
