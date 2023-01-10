const mongoose = require('mongoose');

const eventCompany = new mongoose.Schema({
    company:{
        type: String,
        required :true
    },
    eligibility:{
        type: String,
        required :true
    }
});

const Companywise = mongoose.model('Company', eventCompany);

module.exports = Companywise;