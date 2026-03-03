const Service = require('./serviceModel');
const mongoose = require('mongoose');

// GET all public services
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ createdAt: -1 });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching services.' });
    }
};

// GET all services for the logged-in provider
const getProviderServices = async (req, res) => {
    const providerId = req.user._id;
    try {
        const services = await Service.find({ providerId }).sort({ createdAt: -1 });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: 'Server error while fetching your services.' });
    }
};

// GET a single service by ID
const getServiceById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid service ID format.' });
    }
    const service = await Service.findById(id);
    if (!service) {
        return res.status(404).json({ error: 'Service not found.' });
    }
    res.status(200).json(service);
};

// POST a new service
const createService = async (req, res) => {
    const { name, category, description, price, stock, imageUrl } = req.body;

    try {
        const providerId = req.user._id;
        const providerName = req.user.name;
        const service = await Service.create({ name, category, description, price, stock, imageUrl, providerId, providerName });
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// UPDATE a service
const updateService = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid service ID format.' });
    }
    const service = await Service.findOneAndUpdate({ _id: id, providerId: req.user._id }, { ...req.body }, { new: true });
    if (!service) {
        return res.status(404).json({ error: 'Service not found or you do not have permission to edit it.' });
    }
    res.status(200).json(service);
};

// DELETE a service
const deleteService = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid service ID format.' });
    }
    // We also check that the service belongs to the logged-in user
    const service = await Service.findOneAndDelete({ _id: id, providerId: req.user._id });
    if (!service) {
        return res.status(404).json({ error: 'Service not found or you do not have permission to delete it.' });
    }
    // TODO: In a real app, you would also delete associated bookings here.
    res.status(200).json({ message: 'Service deleted successfully.' });
};

module.exports = {
    getAllServices,
    getProviderServices,
    getServiceById,
    createService,
    updateService,
    deleteService
};