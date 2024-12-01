const crypto = require("crypto");
const moment = require("moment");

const config = {
  tmCode: process.env.VNPAY_TMCODE,
  hashSecret: process.env.VNPAY_HASHSECRET,
  url: process.env.VNPAY_URL,
  returnUrl: process.env.VNP_RETURN_URL,
};

// Kiểm tra từng giá trị config
Object.entries(config).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing VNPAY config: ${key}`);
  }
});

// Log toàn bộ config (che giấu hashSecret)
console.log('VNPAY Config:', {
  ...config,
  hashSecret: config.hashSecret ? '******' : undefined
});

exports.vnpayConfig = config;
