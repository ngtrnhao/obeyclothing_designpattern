// Define the PaymentContext class
class PaymentContext {
    constructor() {
      this.strategy = null; // No strategy selected initially
    }
  
    // Set the payment strategy
    setStrategy(strategy) {
      this.strategy = strategy;
    }
  
    // Execute the selected payment strategy
    executeStrategy(params) {
      if (!this.strategy) {
        throw new Error("No payment strategy selected");
      }
      this.strategy.execute(params);
    }
  }
  
  // Define the CODPayment strategy
  class CODPayment {
    execute({ amount }) {
      console.log(`Processing Cash on Delivery payment of $${amount}`);
    }
  }
  
  // Define the VNPayPayment strategy
  class VNPayPayment {
    execute({ amount }) {
      console.log(`Processing VNPay payment of $${amount}`);
    }
  }
  
  // Define the PayPalPayment strategy
  class PayPalPayment {
    execute({ amount }) {
      console.log(`Processing PayPal payment of $${amount}`);
    }
  }
  
  // Test the Strategy Pattern
  const testStrategyPattern = () => {
    const paymentContext = new PaymentContext();
  
    const paymentDetails = { amount: 100 }; // Example payment details
  
    // Test CODPayment
    console.log("Testing CODPayment...");
    paymentContext.setStrategy(new CODPayment());
    paymentContext.executeStrategy(paymentDetails);
  
    // Test VNPayPayment
    console.log("Testing VNPayPayment...");
    paymentContext.setStrategy(new VNPayPayment());
    paymentContext.executeStrategy(paymentDetails);
  
    // Test PayPalPayment
    console.log("Testing PayPalPayment...");
    paymentContext.setStrategy(new PayPalPayment());
    paymentContext.executeStrategy(paymentDetails);
  };
  
  // Run the test
  testStrategyPattern();