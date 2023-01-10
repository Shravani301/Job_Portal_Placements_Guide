const express=require('express')
const app=express()
const bodyParser = require('body-parser');

var fs = require('fs');
var path = require('path');

const mongoose = require('./config/mongoose');
const Post = require('./model/Post');
const Student=require('./model/Student');
const Event=require('./model/Eventregistered')
const Company=require('./model/Companywise')

//To store image files
var multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.student_rollno+'.jpg')
    }
});
  
const upload = multer({ storage: storage });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

const validate=function(req,res,next){
    Student.find({student_rollno:req.body.id,student_pass:req.body.p},(err,student)=>{
        if(err){
            console.log('error')
        }
        else{
            if(student.length>0){
                
                next()
            }
            else if(req.body.id=='admin' && req.body.p=='admin'){
                res.render('admin')     
            }
            else{
                
                res.render('login',{errormsg:'1'})
                
            }
        }
    })
    
    
    
}






app.get('/',(req,res)=>{
    res.render('login')
})
app.post('/admin',(req,res)=>{
    const post=new Post({
        title:req.body.eventtitle,
        company:req.body.eventcompany,
        branch:req.body.eventbranch,
        description:req.body.eventdescription,
        deadline:req.body.eventdeadline,
        link:req.body.eventlink,
        companycontact:req.body.eventcompanycontact,
    })
    post.save()
    res.render('admin')

})
app.post('/poststudent',upload.single('student_image'),(req,res)=>{
    
    const student=new Student({
        
        student_rollno:req.body.student_rollno,
        student_name:req.body.student_name,
        student_cgpa:req.body.student_cgpa,
        student_img:req.file.filename,
        student_mobile:req.body.student_mobile,
        student_program:req.body.student_program,
        student_branch:req.body.student_branch,
    })
    student.save()
    res.render('admin')
    
})

app.get('/home/:s_id/:id',(req,res)=>{
    
        let promises = [
        Post.findById({_id:req.params.id}),
        Student.find({student_rollno:req.params.s_id})
        ]
        

    return Promise.all(promises)
        .then(response => {
            var now=new Date();
            var term = new Date(parseInt(response[0].deadline.slice(0,4)), parseInt(response[0].deadline.slice(5,7))-1, parseInt(response[0].deadline.slice(8,), 0, 0, 0, 0));
            
            var Difference_In_Time = term.getTime() - now.getTime();
            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

            
            res.render('upcomingevent', { post: response[0], students: response[1],ddline:Math.round(Difference_In_Days),c:0 })
        })
        .catch(err => {
            console.log(err)
        })
})
app.get('/home/yourapplications/:s_id/:id',(req,res)=>{
    
    let promises = [
    Post.findById({_id:req.params.id}),
    Student.find({student_rollno:req.params.s_id})
    ]
    

return Promise.all(promises)
    .then(response => {
        var now=new Date();
        var term = new Date(parseInt(response[0].deadline.slice(0,4)), parseInt(response[0].deadline.slice(5,7))-1, parseInt(response[0].deadline.slice(8,), 0, 0, 0, 0));
        
        var Difference_In_Time = term.getTime() - now.getTime();
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

        
        res.render('upcomingevent', { post: response[0], students: response[1],ddline:Math.round(Difference_In_Days),c:1 })
    })
    .catch(err => {
        console.log(err)
    })
})
app.get('/placements/:year/:s_id',(req,res)=>{
    Student.find({student_rollno:req.params.s_id},(err,students)=>{
        res.render('plac2022',{students:students,year:req.params.year})
    })
    
})
app.post('/applyevent/:s_id/:id',(req,res)=>{
    Post.findById({_id:req.params.id},(err,post)=>{
        if(err)
            console.log('Error reading the post',err);
        else{
            
            Event.find({student_id:req.params.s_id,event_id:req.params.id },(err,eve)=>{
                if(eve.length==0){
                    const event=new Event({

                        student_id:req.params.s_id,
                        event_id:req.params.id
        
                    })
                    event.save()
                    res.redirect('/home/'+req.params.s_id+'/'+req.params.id)

                }
            })
        }
        }
            
    );})

app.get('/logout',(req,res)=>{
    res.redirect('/')
})
app.get('/admin/DB',(req,res)=>{
    let promises = [
        Post.find({}),
        Student.find(),
        Event.find(),
        Company.find({})
    ]

    return Promise.all(promises)
        .then(response => {
            
            res.render('DB', { posts: response[0], students:response[1], events:response[2],companye:response[3] })
        })
        .catch(err => {
            console.log(err)
        })
})


app.use('/home',validate);
app.post('/home',(req,res)=>{
    let promises = [
        Post.find({}),
        Student.find({student_rollno:req.body.id}),
        Event.find({student_id:req.body.id })
    ]

    return Promise.all(promises)
        .then(response => {
            
            res.render('home', { posts: response[0], students:response[1], events:response[2] })
        })
        .catch(err => {
            console.log(err)
        })
    
})
app.get('/deletestudent/:st_id',(req,res)=>{
    Student.findByIdAndDelete({_id:req.params.st_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            res.redirect('/admin/DB')
    })
    

})
app.get('/deletepost/:p_id',(req,res)=>{
    Post.findByIdAndDelete({_id:req.params.p_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            res.redirect('/admin/DB')
    })
    

})
app.get('/deletecompanye/:e_id',(req,res)=>{
    Company.findByIdAndDelete({_id:req.params.e_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            res.redirect('/admin/DB')
    })
    

})
app.get('/editstudent/:stt_id',(req,res)=>{
    Student.findById({_id:req.params.stt_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else{
            res.render('editstudent',{students:success})
        }
    })
    
})
app.get('/editcompanye/:e_id',(req,res)=>{
    Company.findById({_id:req.params.e_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            
            res.render('editcompany',{companye:success})
    })
    
})

app.get('/editpost/:p_id',(req,res)=>{
    Post.findById({_id:req.params.p_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            
            res.render('editpost',{posts:success})
    })
    
})

app.get('/userprofile/:st_id',(req,res)=>{
    Student.findById({_id:req.params.st_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            
            res.render('profile',{students:[success]})
    })
})
app.post('/editstudent/:st_id',(req,res)=>{
    const updateddetails={
        student_rollno:req.body.student_rollno,
        student_name:req.body.student_name,
        student_cgpa:req.body.student_cgpa,
        student_mobile:req.body.student_mobile,
        student_pass:req.body.student_pass,
        student_program:req.body.student_program,
        student_branch:req.body.student_branch

    }


    Student.findByIdAndUpdate({_id:req.params.st_id},updateddetails,(err,suc)=>{
        if(err){
            console.log('error')
        }
        else {
            res.redirect('/admin/DB')
        }
    })

})
app.post('/editcompanye/:e_id',(req,res)=>{
    const updateddetails={
        company:req.body.company,
        eligibility:req.body.eligibility

    }


    Company.findByIdAndUpdate({_id:req.params.e_id},updateddetails,(err,suc)=>{
        if(err){
            console.log('error')
        }
        else {
            res.redirect('/admin/DB')
        }
    })

})
app.post('/editpost/:p_id',(req,res)=>{
    const updateddetails={
        title:req.body.eventtitle,
        company:req.body.eventcompany,
        branch:req.body.eventbranch,
        description:req.body.eventdescription,
        deadline:req.body.eventdeadline,
        link:req.body.eventlink,
        companycontact:req.body.eventcompanycontact,

    }


    Post.findByIdAndUpdate({_id:req.params.p_id},updateddetails,(err,suc)=>{
        if(err){
            console.log('error')
        }
        else {
            res.redirect('/admin/DB')
        }
    })

})
app.post('/seditstudent/:st_id',(req,res)=>{
    const updateddetails={
        student_rollno:req.body.student_rollno,
        student_name:req.body.student_name,
        student_cgpa:req.body.student_cgpa,
        student_mobile:req.body.student_mobile,
        student_pass:req.body.student_pass,
        student_branch:req.body.student_branch

    }
    Student.findByIdAndUpdate({_id:req.params.st_id},updateddetails,(err,suc)=>{
        if(err){
            console.log('error')
        }
        else {
            res.redirect('/userprofile/'+req.params.st_id)
        }
    })

})
app.get('/editprofile/:st_id',(req,res)=>{
    Student.findById({_id:req.params.st_id},(err, success)=>{
        if(err)
            console.log('Error deleting the post',err);
        else
            
            res.render('editprofile',{students:[success]})
    })
})

app.post('/companywise',(req,res)=>{
    const cw=new Company({
        company:req.body.company,
        eligibility:req.body.eligibility
    })
    cw.save()
    res.redirect('/admin/DB')
})
app.get('/companywiseeligibility/:st_id',(req,res)=>{
    let promises = [
        Student.find({student_rollno:req.params.st_id}),
        Company.find({})
        
    ]

    return Promise.all(promises)
        .then(response => {
            
            res.render('companywise', {students:response[0],company:response[1]})
        })
        .catch(err => {
            console.log(err)
        })
})


app.listen(8000)