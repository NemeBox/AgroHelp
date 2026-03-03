const Service = require('./serviceModel');
const mongoose = require('mongoose');
const User = require('./userModel'); // We need the User model to look up the provider's name.

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
        // The user ID is attached to the request by the requireAuth middleware.
        const providerId = req.user._id;

        // The error "providerName is required" happens because req.user.name is undefined.
        // This is likely because the requireAuth middleware isn't fetching the 'name' field.
        // The correct long-term fix is in that middleware, but we can fix it here by fetching the user.
        const provider = await User.findById(providerId).select('name').lean();
        if (!provider) {
            return res.status(401).json({ error: 'Provider account not found for this token.' });
        }

        const service = await Service.create({ name, category, description, price, stock, imageUrl, providerId, providerName: provider.name });
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