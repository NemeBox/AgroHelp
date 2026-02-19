const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Tool', 'Fertilizer', 'Consultancy', 'Soil Testing', 'Heavy Machinery', 'Other']
    },
    description: {
        type: String,
        required: false,
        maxlength: 500
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    // Link product to the user who created it
    user_id: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);