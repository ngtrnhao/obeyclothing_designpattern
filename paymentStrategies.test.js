import { CODPayment } from "../paymentStrategies";

jest.mock("axios");

describe("CODPayment Strategy", () => {
  it("should execute COD payment successfully", async () => {
    const mockAxios = require("axios");
    mockAxios.post.mockResolvedValue({
      data: { order: { _id: "12345" } },
    });

    const mockNavigate = jest.fn();
    const mockClearCart = jest.fn();

    const codPayment = new CODPayment();
    await codPayment.execute({
      shippingInfo: { fullName: "John Doe" },
      cartItems: [{ product: { name: "Shirt" }, quantity: 1 }],
      voucher: null,
      total: 100000,
      discountAmount: 0,
      finalAmount: 100000,
      token: "mockToken",
      clearCart: mockClearCart,
      navigate: mockNavigate,
    });

    expect(mockAxios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/api/orders/create-cod-order`,
      expect.any(Object),
      expect.any(Object)
    );
    expect(mockClearCart).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/order-success/12345");
  });
});