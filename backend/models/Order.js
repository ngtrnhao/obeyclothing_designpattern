const mongoose = require("mongoose");
const OrderStateFactory = require("../factories/OrderStateFactory");
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paypalOrderId: { type: String },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "awaiting_payment",
      ],
      default: "pending",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        size: String,
        color: String,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    shippingInfo: {
      fullName: String,
      phone: String,
      streetAddress: String,
      provinceCode: String,
      districtCode: String,
      wardCode: String,
      provinceName: String,
      districtName: String,
      wardName: String,
    },
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    delivery: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery" },
    paymentMethod: {
      type: String,
      enum: ["cod", "paypal", "banking", "vnpay"],
      required: true,
    },
    codStatus: {
      type: String,
      enum: ["pending", "collected", "failed"],
      default: "pending",
    },
    codAmount: {
      type: Number,
      required: function () {
        return this.paymentMethod === "cod";
      },
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
//Phương thức khởi tạo state
orderSchema.methods.initializeState = function () {
  this.state = OrderStateFactory.createState(this.status, this);
  return this.state;
};
//Phương thức thay đổi trạng thái
orderSchema.methods.changeState = async function (newStatus) {
  try {
    console.log(`[DEBUG] Bắt đầu chuyển trạng thái từ ${this.status} sang ${newStatus}`);
    
    // Kiểm tra nếu đang chuyển sang trạng thái hiện tại
    if (this.status === newStatus) {
      console.log(`[DEBUG] Đơn hàng đã ở trạng thái ${newStatus}`);
      return {
        success: true,
        message: `Đơn hàng đã ở trạng thái ${newStatus}`
      };
    }

    if (!this.state) {
      console.log(`[DEBUG] Khởi tạo state vì this.state không tồn tại`);
      this.initializeState();
    }

    console.log(`[DEBUG] State hiện tại: ${this.state.getName()}`);

    // Kiểm tra trạng thái hợp lệ
    const validStates = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'awaiting_payment'];
    if (!validStates.includes(newStatus)) {
      console.log(`[DEBUG] Trạng thái không hợp lệ: ${newStatus}`);
      throw new Error(`Trạng thái không hợp lệ: ${newStatus}`);
    }

    // Ánh xạ tên trạng thái sang tên phương thức
    const methodMap = {
      'processing': 'process',
      'shipped': 'ship',
      'delivered': 'deliver',
      'cancelled': 'cancel',
      'awaiting_payment': 'await',
      'pending': 'pending'
    };

    // Sửa cách tạo tên phương thức kiểm tra chuyển đổi
    const baseAction = methodMap[newStatus] || newStatus.toLowerCase();
    const canChangeMethod = `can${baseAction.charAt(0).toUpperCase() + baseAction.slice(1)}`;

    console.log(`[DEBUG] Kiểm tra phương thức: ${canChangeMethod}`);
    console.log(`[DEBUG] Phương thức tồn tại: ${typeof this.state[canChangeMethod] === 'function'}`);
    
    if (typeof this.state[canChangeMethod] !== 'function' || this.state[canChangeMethod]() === false) {
      console.log(`[DEBUG] Không thể chuyển trạng thái - canChangeMethod thất bại`);
      throw new Error(`Không thể chuyển từ trạng thái ${this.state.getName()} sang ${newStatus}`);
    }

    // Đặt tên phương thức hành động tương ứng
    const actionMethod = baseAction;
    
    console.log(`[DEBUG] Gọi phương thức ${actionMethod}()`);
    const result = await this.state[actionMethod]();
    console.log(`[DEBUG] Kết quả sau khi gọi ${actionMethod}(): ${result}`);

    if (typeof result === 'string' && result.includes('Không thể')) {
      console.log(`[DEBUG] Phát hiện thông báo lỗi trong kết quả`);
      throw new Error(result);
    }

    // Khi cập nhật trạng thái, cần gán thêm timestamp tương ứng
    if (newStatus === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date();
    } else if (newStatus === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date();
    }
    
    // Cập nhật trạng thái và lưu
    console.log(`[DEBUG] Cập nhật trạng thái thành ${newStatus}`);
    this.status = newStatus;
    this.state = OrderStateFactory.createState(newStatus, this);
    await this.save();
    console.log(`[DEBUG] Đã lưu đơn hàng với trạng thái mới`);

    return {
      success: true,
      message: result
    };
  } catch (error) {
    console.error(`[DEBUG ERROR] ${error.message}`);
    console.error(`[DEBUG ERROR] Stack: ${error.stack}`);
    return {
      success: false,
      message: `Lỗi khi thay đổi trạng thái: ${error.message}`
    };
  }
};
//Phương thức để trả sản phẩm về kho khi hủy đơn hàng
orderSchema.methods.returnProductToStock = async function () {
  const Product = mongoose.model("Product");

  for (const item of this.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }
};
// Các phương thức xử lý trạng thái
orderSchema.methods.processPending = function () {
  return this.state.pending();
};

orderSchema.methods.processOrder = function () {
  return this.state.process();
};

orderSchema.methods.shipOrder = function () {
  return this.state.ship();
};

orderSchema.methods.deliverOrder = function () {
  return this.state.deliver();
};

orderSchema.methods.cancelOrder = function () {
  return this.state.cancel();
};

orderSchema.methods.awaitPayment = function () {
  return this.state.await();
};

// Middleware để khởi tạo state
orderSchema.post("init", function () {
  this.initializeState();
});

orderSchema.post("save", function () {
  if (!this.state) {
    this.initializeState();
  }
});

module.exports = mongoose.model("Order", orderSchema);
