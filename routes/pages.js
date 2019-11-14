var express=require('express');
var router=express.Router();
var mongoose=require('mongoose');
var Schema=require('../models/page')
var Pages= mongoose.model("Pages",Schema);

/*
* GET /
*/

router.get('/', async function(req,res){

 await   Pages.findOne({slug:'home'},function(err,page){
        if(err){
            console.log("error in router.get('/) "+err);
        }
            res.render('index',{
                title:page.title,
                content:page.content
            });
        
        });

    });

/*
* GET a page
*/

router.get('/:slug', async function(req,res){
    var slug=req.params.slug;

  await Pages.findOne({slug:slug},function(err,page){
        if(err){
            console.log("error in pages.js in /:slug "+err);
        }
        if(!page){
            res.redirect('/');
        }else{
            res.render('index',{
                title:page.title,
                content:page.content
            });
        }

    });
});



module.exports=router;