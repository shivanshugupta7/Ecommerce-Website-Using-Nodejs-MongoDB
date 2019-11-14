var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');

// get product model
var Schema=require('../models/product')
var Product= mongoose.model("products",Schema);

var Schema1=require('../models/cart')
var Cart= mongoose.model("cart",Schema1);

var Schema2=require('../models/user')
var User= mongoose.model("users",Schema2);


/*
* GET add product to cart 
*/

router.get('/add/:product',async function(req,res){

  var slug= req.params.product;
  await  Product.findOne({slug:slug},function(err,p){
        if(err){
            console.log("error in /add/:product in cart.js"+err);
        }
        if(typeof req.session.cart == "undefined") {

            req.session.cart=[];
            req.session.cart.push({
                title:slug,
                qty:1,
                tt:p.tt,
                price :parseFloat(p.price).toFixed(2),
                image:'/product_images/'+p._id+'/'+p.image
            });
            var cart=new Cart({
                title:slug,
                qt:1,
                price :parseFloat(p.price).toFixed(2),
                image:'/product_images/'+p._id+'/'+p.image, 
                username:req.cookies.username
               
            });
            cart.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('added to cart mongodb 1st');
                }
            });
            
        }else{
                var cart=req.session.cart;
                var newItem=true;
                for(var i=0;i<cart.length;i++){
                    if(cart[i].title==slug){
                        cart[i].qty++;
                        newItem=false;
                        break;
                    }
                }
                if(newItem){
                    cart.push({
                        title:slug,
                        qty:1,
                        tt:p.tt,
                        price :parseFloat(p.price).toFixed(2),
                        image:'/product_images/'+p._id+'/'+p.image
        
                    });
                
                  var cart=new Cart({
                    title:slug,
                    qt:1,
                    price :parseFloat(p.price).toFixed(2),
                    image:'/product_images/'+p._id+'/'+p.image,
                    username:req.cookies.username
    
                })
                cart.save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('added to cart mongodb');
                    }
                })
            }
        }
           
            req.flash('success','Product added');
            res.redirect('back'); 

        });

    });


    // get checkout page
    router.get('/checkout',async function(req,res){
        Cart.find({username:req.cookies.username},function(err,p){
                if(err){
                    console.log(err);
                }
                if(p.length==0){
                    res.render('emptycart',{
                        title:"Empty Cart"
                    });
                }
                else{
                res.render('checkout',{
                            title:'CheckOut',
                            cart:p
                        });
                    }
        })
    //   if(req.session.cart && req.session.length ==0){ // if cart is empty to show your cart is empty not empty table
    //     await  delete req.session.cart;
    //       res.redirect('/cart/checkout');
     
    //     }
    //   else{
          
    //     await res.render('checkout',{
    //         title:'CheckOut',
    //         cart:req.session.cart
    //     });
    // } 
});
        
  // get update  product
  router.get('/update/:product', async function(req,res){
    var slug=req.params.product;
    var cart=req.session.cart; 
    var action=req.query.action;
        Cart.find({username:req.cookies.username},async function(err,p){  
            if(err){
            console.log(err);
        }
        for(var i=0;i<p.length;i++){
            if( p[i].title == slug ){
                console.log(p[i].title);
                console.log(p[i].qt);
                switch(action){
                 case "add":
            await   Cart.findOneAndUpdate({title:p[i].title},{ qt:p[i].qt+(1) },{new:true});
                    break;
                    case "remove":
                    await   Cart.findOneAndUpdate({title:p[i].title},{ qt:p[i].qt-(1) },{new:true});
                            break;
                            case "clear":
                        await Cart.findOneAndDelete({title:p[i].title});
                                break;
                        default:
                            console.log("update problem in /update/:product");
                            break;
                }
        }
        
    }
});


    // for(var i=0;i< cart.length;i++){
    //     if(cart[i].title==slug){
    //         switch(action){
    //             case "add":
    //                 cart[i].qty++;
    //                 break;
    //             case "remove":
    //                 cart[i].qty--;
    //                 if(cart[i].qty < 1){
    //                     console.log("qty is less than 1 ");
    //                     cart.splice(i,1);
    //                 }
    //                 break;
    //             case "clear":
    //                 cart.splice(i,1);
    //                 if(cart.length==0) {
    //                     delete req.session.cart;
    //                     break;
    //                 }       
    //             default:
    //                 console.log("update problem in /update/:product");
    //                 break;
    //         }
    //         break;
    //     }
    // }
    req.flash('success','Cart updated');
    res.redirect('/cart/checkout');
});



    // get clear cart
    router.get('/clear',async function(req,res){
        // Cart.findOneAndDelete({username:req.cookies.username},function(err,find){
        //             if(err){
        //                 console.log(err);
        //             }else{
        //                     console.log("Cleared cart");
        //             }
        // });
        // Cart.find({username:req.cookies.username},async function(err,p){ 
        //     if(err){
        //         console.log(err);
        //     }
        //     console.log(p.length);
        //         for(var i=0;i<p.length;i++){ 

                     Cart.deleteMany({username:req.cookies.username},async function(err)
                     {
                         if(err)
                         {
                             console.log("error in clearing cart");
                         }
                            console.log("cleared cart ");         
                     });                    
                        // }
       
        delete req.session.cart;
        req.flash('success','Cart cleared');
        res.redirect('/cart/checkout');
        
    });
  

    // get buynow 
    router.get('/buynow',async function(req,res){
        
        Cart.find({username:req.cookies.username},async function(err,p){  
            if(err){
            console.log(err);
        }
        // console.log(p.qt);
        for(var i=0;i<p.length;i++){
            var a=(p[i].qt);  
         await   Product.findOne({slug:p[i].title},function(err,p1){
                if(err){
                    console.log(err);
                }
                var tt=p1.tt;
                console.log(tt);
                console.log(a);
                t=tt-a;
                console.log(t);
                for(var i=0;i<p.length;i++){
                    Product.findOneAndUpdate({slug:p[i].title},{tt:t},{new:true},function(err){
                        if(err){
                            console.log(err);
                        }else{
                                console.log("updated products in admin side also");
                        }
                    });         
                            
                     }

                       
                        // Product.findOneAndUpdate({slug:p1.title},{tt:t},{new:true});

                
            }); 
            console.log("updated in products");
            // console.log(p[i].title);
                // console.log(p[i].qt);
        }
         
            });
        
    Cart.deleteMany({username:req.cookies.username},async function(err)
    {
        if(err)
        {
            console.log("error in clearing cart");
        }
           console.log("cleared cart ");         
    }); 

        //    var cart=req.session.cart; 
        //    for(var i=0;i< cart.length;i++){
        //        const filter={slug:cart[i].title};

        //    Product.findOne(filter ,function(err,product){
        //         if(err){
        //             console.log(err);
        //         }
        //         else{
        //                 var tt = product.tt;
        //                 let doc=  Product.findOneAndUpdate(filter,tt-1);
        //         }
        //      });  
            //     console.log(doc.tt);
            // }
            
       delete req.session.cart;
            res.sendStatus(200);
    });   
      


module.exports=router;