const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    description: { type: String, required: [true, 'Description is required'] },
    date: { type: Date, required: [true, 'Date is required'] },
    city: { type: String, required: [true, 'City is required'] },
    capacity: { type: Number, required: [true, 'Capacity is required'] },
    category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: [true, 'Category is required'] 
}
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);