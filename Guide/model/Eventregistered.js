const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    student_id:{
        type: String,
        required :true
    },
    event_id:{
        type: String,
        required :true
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;