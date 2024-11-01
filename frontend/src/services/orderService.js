import api from './api';

export const createCodOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/cod', orderData);
    console.log('Create COD order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating COD order:', error);
    throw error;
  }
}; 