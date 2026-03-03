const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 1 },
    imageUrl: { type: String },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // This links the service to a user
    },
    providerName: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);