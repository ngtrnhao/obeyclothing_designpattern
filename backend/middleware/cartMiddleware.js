const validateCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }
    
    req.cart = cart;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi kiểm tra giỏ hàng' });
  }
};

module.exports = validateCart;
