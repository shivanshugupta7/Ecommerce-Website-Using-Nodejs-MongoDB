var express=require('express');
var router=express.Router();
var bodyParser=require('body-parser');
var mkdirp=require('mkdirp');
var fs=require('fs-extra');
var mkdirp=require('resize-img');
var app = express();
var mongoose=require('mongoose');
mongoose.set('useFindAndModify', false);
var resizeImg = require('resize-img');

var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get Category model
var Schema1=require('../models/category')
var Category= mongoose.model("category",Schema1);

//get product model
var Schema=require('../models/product')
var Product= mongoose.model("product",Schema);

app.use(bodyParser.urlencoded({ extended: true })); 


/*
 Get products indexes
*/
router.get('/',isAdmin,async function (req,res) {
   
    var count;
   await Product.countDocuments(function(err,c){
        count=c;
    })
   await Product.find(function(err,products){
        res.render('admin/products',{
            products:products,
            count:count,
            msg:""
        })
    })
});

/*
 Get add product
*/
router.get('/add-product',isAdmin,async function(req,res){

    var title = "";
    var desc = "";
    var price = "";
    var tt="";
    await Category.find(function(err,categories){
    res.render('admin/add_product',{
        title:title,
        desc:desc,
        categories:categories,
        price:price, 
        tt:tt,
        msg:""   
      });
   })
});


//POST ADD Product
router.post('/add-product',async function(req,res){
            var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
            var tt= req.body.tt;
            var title=req.body.title;
            var slug=title.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
            var desc=req.body.desc;
            var price=req.body.price;
            var category=req.body.category;
        
           await Product.findOne({slug:slug},async function(err,product){
                if(product){
                    req.flash('danger','Page title exists,choose another');
                    Category.find(function(err,categories){
                        res.render('admin/add_product',{
                                title:title,
                                desc:desc,
                                categories:categories,
                                price:price,
                                tt:tt,
                                msg:""
                        });
                    });
                }
                else{
                    
                    var price2= parseFloat(price).toFixed(2);
                    var product =new Product({
                        title:title,
                        slug:slug,
                        desc:desc,
                        price:price2,
                        tt:tt,
                        category:category,
                        image:imageFile,
                    })
                    
                    await product.save(function(err){
                        if(err) return console.log(err);
                        else{

                            fs.mkdirSync('public/product_images/' + product._id,function(err){
                              if(err)
                                return console.log("error in first mkdirp "+ err);
                                else{
                                    console.log("dir created in first mkdir")
                                } 
                            });
                            
                            fs.mkdirSync('public/product_images/'+product._id +'/gallery',function(err){
                               
                                if(err)
                                return console.log("error in first mkdirp "+ err);
                                else console.log("dir created in 2 mkdir");
                            });
                            
                            fs.mkdirSync('public/product_images/'+product._id +'/gallery/thumbs',function(err){
                                if(err)
                                return console.log("error in first mkdirp "+ err);
                                else console.log("dir created in 3 mkdirp");
                            })

                            if(imageFile != ""){
                                var productImage=req.files.image;
                               
                                var path='public/product_images/' + product._id + '/'+imageFile;
                                 productImage.mv(path,function(err){
                                     if(err){
                                          return console.log("ERROR IN PRODUCT IMAGE MV"+err);
                                     }
                                     else{
                                            console.log("no error in productImage mv");
                                     }
                                });
                            }
                            req.flash('success','Product added');
                            res.redirect('/admin/products');
                        }
                    });
                  
                }
           });
  
});



/*
 Get Edit product
*/
router.get('/edit-product/:id', isAdmin,async function(req,res){

            var errors;

            if(req.session.errors) errors=req.session.errors;
             req.session.errors=null;  
            
            await Category.find(function(err,categories){
                Product.findById(req.params.id,function(err,p){
                    if(err){
                        console.log(err);
                        res.redirect('/admin/products');
                    }
                    else{
                        var galleryDir='public/product_images/'+p._id+'/gallery'
                        var galleryImages =null;
                       
                       fs.readdir(galleryDir,function(err,files){
                           if(err){
                               console.log("error in fs.readdir"+err);
                           }else{
                                galleryImages=files;
                               
                                res.render('admin/edit_product',{
                                    title:p.title,
                                    errors:errors,
                                    desc:p.desc,
                                    categories:categories,
                                    tt:p.tt,
                                    price:p.price,
                                    msg:"",
                                    category:p.category.replace(/\s+/g,'-').toLowerCase(),
                                    galleryImages:galleryImages,
                                    id:p.id,
                                    image:p.image
                            });
                           }
                       })
                    }
                })
            });  
});


//POST EDIT Product
router.post('/edit-product/:id', async function(req,res){
   
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
            
    var title=req.body.title;
    var slug=title.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
    var desc=req.body.desc;
    var price=req.body.price;
    var category=req.body.category;
    var pimage =req.body.pimage;
    var id = req.params.id;
    var tt=req.body.tt;
    
    
         await Product.findOne({slug:slug, _id:{'$ne':id}},async function(err,p){
                if(err)console.log("error in post edit product 1st"+err);
           
            if(p){
                req.flash('danger','Product title exits, choose another');
                res.redirect('/admin/products/edit-product/'+id);
          
            }else{
                await Product.findById(id,function(err,p){
                    if(err)console.log(err);
                  
                    p.title=title;
                    p.slug=slug;
                    p.desc=desc;
                    p.tt=tt;
                    p.price=parseFloat(price).toFixed(2);
                    p.category=category;
                    if(imageFile != ""){
                        p.image =imageFile;
                    }
                    p.save( function(err){
                        if(err)console.log(err);
                    if(imageFile != ""){
                        if(pimage != ""){
                            fs.remove('public/product_images/'+id+'/'+pimage,function(err){
                                if(err)console.log(err);
                            });
                              var productImage =req.files.image;
                            var path= 'public/product_images/'+id+'/'+imageFile;
                            productImage.mv(path,function(err){
                               if(err) {return console.log("error in mv in post edit"+err);}
                               else{
                                   console.log('uploaded');
                               }
                            });
                        }
                        

                    }
                    req.flash('success','Product Edited');
                    res.redirect('/admin/products/edit-product/'+id);

                    });
                });
            }
        });
        
    
});

/*
 post product gallery
*/
router.post('/product-gallery/:id',  async function (req,res) {
    
    var productImage=req.files.file;
    var id= req.params.id;
    var path='public/product_images/'+id+'/gallery/'+req.files.file.name;
    var thumbsPath='public/product_images/'+id+'/gallery/thumbs/'+req.files.file.name;
 
     await productImage.mv(path,function(err){
        if(err){
            console.log("error in mv in post product gallery"+err);
        }
        resizeImg(fs.readFileSync(path),{width:100, height:100 }).then(function(buf){
           console.log("in resize image");
            fs.writeFileSync(thumbsPath,buf);
        });
    });
    res.sendStatus(200);

});



/*
 Get delete image
*/
router.get('/delete-image/:image',isAdmin,  function (req,res) {
    var originalImage='public/product_images/'+req.query.id+'/gallery/'+req.params.image;
    var thumbImage='public/product_images/'+req.query.id+'/gallery/thumbs/'+req.params.image;
    fs.remove(originalImage,function(err){
        if(err){
            console.log("error in get delete gallery image"+err);
        }else{
            fs.remove(thumbImage,function(err){
                if(err){
                    console.log("error in fs thumbpImage"+err);
                }else{
                    req.flash('success','Image deleted');
                    res.redirect('/admin/products/edit-product/'+req.query.id);

                }
            });
        }
    });


});



/*
 Get delete roduct
*/
router.get('/delete-product/:id', isAdmin,async function (req,res) {

    var id=req.params.id;
    var path='public/product_images/'+id;
    fs.remove(path,function(err){
        if(err){
            console.log("error in get delete-product/:id"+err);
        }else{
            Product.findByIdAndDelete(id,function(err){
                if(err){
                console.log("error in product.fingByIdAndRemove"+err);
                }else{
                    console.log("deleted");
                }
            });
            req.flash('success','Product deleted');
            res.redirect('/admin/products');

        }
    })


});


//exports
module.exports=router;