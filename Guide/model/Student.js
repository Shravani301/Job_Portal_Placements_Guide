const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    student_rollno: {
        type: String,
        required: true
    },
    student_name:{
        type: String,
        required: true,
        maxLength:20
    },
    student_pass:{
        type:String,
        required:true,
        default:'Password@123'
    },
    student_cgpa:{
        type:String,
        required:true
    },
    student_img:{
        type:String,
        required:true
    },
    student_mobile:{
        type:Number,
        required:true,
        maxLength:10
    },
    student_program:{
        type:String,
        required:true
    },
    student_branch:{
        type:String,
        required:true
    }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;