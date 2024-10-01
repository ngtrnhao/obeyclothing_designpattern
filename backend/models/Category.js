const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }]
});

module.exports = mongoose.model('Category', categorySchema);