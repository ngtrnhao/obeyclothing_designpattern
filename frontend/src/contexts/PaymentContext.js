import { Observable } from "../utils/Observable.js";

export class PaymentContext extends Observable {
  constructor(strategy = null) {
    super(); // Initialize Observable
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executeStrategy(params) {
    if (!this.strategy) {
      throw new Error("No payment strategy selected");
    }

    // Execute the payment strategy
    const result = await this.strategy.execute(params);

    // Notify observers about the payment status
    this.notify({ status: "success", details: result });
  }
}
class PaymentContext {
  constructor(strategy = null) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executeStrategy(params) {
    if (!this.strategy) {
      throw new Error("No payment strategy selected");
    }
    await this.strategy.execute(params);
  }
}
async function mockTestPayment() {
  console.log('Testing CODPayment...');
  
  // Specify a base URL when creating the strategy
  const codPayment = new CODPayment('http://localhost:3000'); // or your actual API URL
  const paymentContext = new PaymentContext(codPayment);
  
}
module.exports = { PaymentContext };