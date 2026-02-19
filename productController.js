const Product = require('./productModel');
const mongoose = require('mongoose');

// GET all public products/services
const getAllPublicProducts = async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(400).json({ error: 'Could not fetch products.' });
    }
};

// GET all products for the logged-in user
const getProducts = async (req, res) => {
    const user_id = req.user._id;

    const products = await Product.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(products);
};

// GET a single product
const getProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such product' });
    }

    const product = await Product.findById(id);

    if (!product) {
        return res.status(404).json({ error: 'No such product' });
    }

    // Optional: Check if the product belongs to the user
    if (product.user_id.toString() !== req.user._id.toString()) {
        return res.status(401).json({ error: 'Not authorized to view this product' });
    }

    res.status(200).json(product);
};

// CREATE a new product
const createProduct = async (req, res) => {
    let { name, category, price, stock, description } = req.body;
    const user_id = req.user._id;

    // Defensive coding: trim whitespace from string inputs
    if (typeof name === 'string') name = name.trim();
    if (typeof category === 'string') category = category.trim();
    if (typeof description === 'string') description = description.trim();

    try {
        // The user_id is automatically converted to a string by Mongoose
        const product = await Product.create({ name, category, description, price, stock, user_id });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE a product
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such product' });
    }

    // Find the product and ensure it belongs to the user trying to delete it
    const product = await Product.findOneAndDelete({ _id: id, user_id: req.user._id });

    if (!product) {
        return res.status(404).json({ error: 'No such product or not authorized' });
    }

    res.status(200).json(product);
};

// UPDATE a product
const updateProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'No such product' });
    }

    const product = await Product.findOneAndUpdate(
        { _id: id, user_id: req.user._id }, // Ensure user owns the product
        { ...req.body },
        { new: true } // Return the updated document
    );

    if (!product) {
        return res.status(404).json({ error: 'No such product or not authorized' });
    }

    res.status(200).json(product);
};

module.exports = {
    getAllPublicProducts,
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct
};