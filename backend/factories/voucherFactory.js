const Voucher = require("../models/Voucher");

class VoucherFactory {
  static create(type, data) {
    switch (type) {
      case "percentage":
        return new PercentageVoucher(data);
      case "fixed":
        return new FixedVoucher(data);
      default:
        throw new Error("Loại voucher không hợp lệ");
    }
  }
}

// Lớp con cho từng loại Voucher
class PercentageVoucher extends Voucher {
  calculateDiscount(totalAmount) {
    if (!this.isValid()) return 0;

    let discount = (totalAmount * this.discountValue) / 100;
    if (this.maxDiscount) {
      discount = Math.min(discount, this.maxDiscount);
    }

    return Math.min(discount, totalAmount);
  }
}

class FixedVoucher extends Voucher {
  calculateDiscount(totalAmount) {
    if (!this.isValid()) return 0;
    return Math.min(this.discountValue, totalAmount);
  }
}

module.exports = VoucherFactory;
