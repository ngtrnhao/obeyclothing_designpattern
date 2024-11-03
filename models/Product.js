const sizeGuideTypeEnum = {
  values: ['TSHIRT', 'MENSHIRT', 'PANTS', 'SHOES'],
  message: '{VALUE} is not a valid size guide type'
};

const productSchema = new Schema({
  // ... other fields
  sizeGuideType: {
    type: String,
    enum: sizeGuideTypeEnum,
    required: true
  }
  // ... other fields
}); 