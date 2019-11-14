var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var fs=require('fs-extra');
var auth=require('../config/auth');
var isUser=auth.isUser;

//get models
var Schema2=require('../models/product')
var Product= mongoose.model("products",Schema2);

//get Category model
var Schema=require('../models/category')
var Category= mongoose.model("categories",Schema);

/*
* GET all products 
*/
router.get('/', async function(req,res){
    console.log(req.cookies.username)
    await Product.find(function(err,products){
        if(err){
            console.log("error in router.get('/) in products.js "+err);
        }
            res.render('all_products',{
                title:'All products',
                products:products
            });
        
        });

    });

/*
* GET all products  by category
*/

router.get('/:category',async function(req,res){

        var categorySlug= req.params.category;
  await   Category.findOne({slug :categorySlug},function(err,c){
    Product.find({category:categorySlug},function(err,products){
        if(err){
            console.log("error in router.get('/:category) in products.js "+err);
        }
            res.render('cat_products',{
                title:c.title,
                products:products
            });
        
        });
    });
})


/*
* GET all products details
*/
router.get('/:category/:product',async function(req,res){

    var galleryImages=null;
    var loggedIn=(req.isAuthenticated()) ? true :false;
   await Product.findOne({slug:req.params.product},function(err,product){
        if(err){
            console.log("err in /:category/:product in products.js"+err);
        }else{
            var galleryDir='public/product_images/'+product._id+'/gallery';
            fs.readdir(galleryDir,function(err,files){
                if(err){
                    console.log("error in /:category/:product in fs readir"+err);
                }else{
                        galleryImages=files;
                        res.render('product',{
                            title:product.title,
                            p:product,
                            galleryImages:galleryImages,
                            loggedIn:loggedIn
                        });
                }
            });
        }
    });
});

module.exports=router;