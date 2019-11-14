var express=require('express');
var router=express.Router();
var bodyParser = require('body-parser');
var app = express();
var mongoose=require('mongoose');

var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get Category model
var Schema=require('../models/category')
var Category= mongoose.model("categories",Schema);


app.use(bodyParser.urlencoded({ extended: true })); 


/*
 Get category indexes
*/
router.get('/',isAdmin, async function (req,res) {
   await Category.find(function(err,categories){
        if(err){
            return console.log(err);
        }else{
            res.render('admin/categories',{
                categories:categories,msg:""

            })
        }
        
    })     
              
   
});

/*
 Get category page
*/
router.get('/add-category',isAdmin,function(req,res){

    var title = "";
   

    res.render('admin/add_category',{
        title:title, 
        msg:""
    });
});


//POST ADD Category
router.post('/add-category',function(req,res){
  

        var title=req.body.title;
        if(title==="" || title===null)
        {
            req.flash('danger','Title empty ');
            res.render('./admin/add_category',{
                title:title,
                 msg:""
            });
        }
        // console.log(title);
        else{
        var slug=title.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
        console.log(slug);
       
        Category.findOne({slug:slug},function(err,category){
                if(category){
                    req.flash('danger','Category title exists,choose another');

                    res.render('/admin/add_category',{
                        title:title,
                       
                    });
                }
                else{
                    // console.log(req.body);
                    var categories = new Category({
                        title:title,
                        slug:slug
                    }) 
                    
                    categories.save(function(err){
                        if(err){
                            console.log("error in categories.save in admin_categories.js"+err);
                        }
                        else{
                            Category.find( async function (err, categories) {
                                if (err) {
                                    console.log(err);
                                } 
                                else {
                                    req.app.locals.categories = categories;
                                }
                            });
                           
                        }
                    })
                        
                            req.flash('success','Category added');
                            res.redirect('/admin/categories');
                        
                }
           })
        }
        
});


/*
 Get Edit category
*/
router.get('/edit-category/:id', isAdmin,async function(req,res){

        await  Category.findById( req.params.id,function(err,category){
            if(err)
            {
                return console.log(err);
            }
            else{
                    res.render('admin/edit_category',{
                        title:category.title,
                        id:category._id,
                        msg: ""
                    })

                }
            
        })
  
});


//POST EDIT Category
router.post('/edit-category/:id',function(req,res){

    var title=req.body.title;
    var slug=title.replace(/\s+/g,'-').toLowerCase();
    var id=req.params.id;
  
       Category.findOne( {slug:slug , _id:{$ne:id} }, async function(err,page){
            if(page){
                
                req.flash('info','slug already exists');
                res.redirect('/admin/pages');
              
            }
            else{
                Category.findOne({slug:slug, _id:{'$ne':id} },function(err,category){
                    if(category){
                        req.flash('danger','Category already exists, choose another');
                        res.render('admin/edit_category',{
                            title:title,
                            id:id,
                            msg:""
                        })
                    }
                else{
               Category.findById(id,function(err,category){
                   if(err){
                       console.log(err);
                   }else{
                       category.title=title;
                       category.slug=slug;

                       category.save(function(err){
                           if(err)
                            return console.log(err)
                            else{
                                Category.find( async function (err, categories) {
                                    if (err) {
                                        console.log(err);
                                    } 
                                    else {
                                        req.app.locals.categories = categories;
                                    }
                                });
                               
                                req.flash('success','Category Edited');
                                res.redirect('/admin/categories/edit-category/'+id);
                            }
                       })
                   }
               })
                
            }
       })

        }
    })
})
/*
 Get delete category
*/
router.get('/delete-category/:id',isAdmin,  function (req,res) {
     Category.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }
        else{
            Category.find( async function (err, categories) {
                if (err) {
                    console.log(err);
                } 
                else {
                    req.app.locals.categories = categories;
                }
            });
           
            req.flash('success','Category Deleted successfully ');
            res.redirect('/admin/categories');
        }
    });
});


//exports
module.exports=router;