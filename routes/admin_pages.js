var express=require('express');
var router=express.Router();
var bodyParser = require('body-parser');
var app = express();
var mongoose=require('mongoose');

var auth=require('../config/auth');
var isAdmin=auth.isAdmin;

//get page model
var Schema=require('../models/page')
var Pages= mongoose.model("Pages",Schema);


app.use(bodyParser.urlencoded({ extended: true })); 


/*
 Get pages indexes
*/
router.get('/', isAdmin,async function (req,res) {

    await Pages.find({}).sort({sorting:1}).exec(function(err,pages){
            res.render('admin/pages',{
                pages:pages,
                msg:""
            });
    });
});

/*
 Get add page
*/
router.get('/add-page',isAdmin,async function(req,res){

    var title = "";
    var slug = "";
    var content = "";

  await  res.render('admin/add_page',{
        title:title,
        slug:slug,
        content:content, 
        msg:""
    });
});


//POST ADD PAGE
router.post('/add-page',function(req,res){
  

        var title=req.body.title;
        var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
        var content=req.body.content;
        
        if(slug=="")
        {
            slug=title.replace(/\s+/g,'-').toLowerCase();
        }

        if(title=== "" && content=="")
        {
            res.render('./admin/add_page', {msg: "Title and Content must have a value"});
        }
        if(title=="")
        {
            res.render('./admin/add_page', {msg: "Title must have a value"});
        }
        if(content=="")
        {
            res.render('./admin/add_page', {msg: "Content must have a value"});
        }
        else
        {
           Pages.findOne({slug:slug},function(err,page){
                if(page){
                    req.flash('danger','Page slug exists,choose another');
                    res.render('/admin/add_page',{
                        title:title,
                        slug:slug,
                        content:content
                    });
                }
                else{
                   
                    var newpages = new Pages({title:title,sorting:100,slug:slug,content:content}); 
                     newpages.save(function(err){
                         if(err)return console.log(err);
                         else{
                            Pages.find({}).sort({sorting: 1}).exec( function (err, pages) {
                                if (err) {
                                    console.log(err);
                                } 
                                else {
                                req.app.locals.pages = pages;
                                }
                            });
                         }
                     })
                  
                   
                     req.flash('success','Page added');
                     res.redirect('/admin/pages');
                  
                }
           })

        }
});

//sort pages function
function sortPages(ids,callback){
        //updating the sorting 
        var count=0;
        for(var i=0;i<ids.length;i++){
            var id = ids[i];
            count++;
        
            (function(count){
        Pages.findById(id,function(err,page){
            page.sorting=count;
            page.save(function(err){
                if(err)
                return console.log(err);
                ++count;
                if(count>=ids.length){
                    callback();
                }
            });
        });
    }) (count);
        
    }
    
}

/*
 post reorder pages 
*/
router.post('/reorder-pages', (req,res)=> {
   
    var ids=req.body['id[]'];
    
     sortPages(ids,function(){

    Pages.find({}).sort({sorting: 1}).exec( function (err, pages) {
        if (err) {
            console.log(err);
        } 
        else {
           req.app.locals.pages = pages;
        }
    });
})
});

/*
 Get Edit page
*/
router.get('/edit-page/:id', isAdmin,async function(req,res){

        await  Pages.findById( req.params.id,function(err,page){
            if(err)
            {
                return console.log(err);
            }
            else{
                        res.render('admin/edit_page',{
                            title:page.title,
                            slug:page.slug,
                            content:page.content,
                            id:page._id,
                            msg: ""
                        })

                }
            
        });
    //      res.render('admin/add_page',{
    //             title:title,
    //             slug:slug,
    //             content:content, 
    //             msg:""
    // });
});


//POST EDIT PAGE
router.post('/edit-page/:id',async function(req,res){

    var title=req.body.title;
    var slug=req.body.slug.replace(/\s+/g,'-').toLowerCase();// replace spaces with dashes and is in lowercase
    var content=req.body.content;
    var id=req.params.id;
  
    var a=title.replace(/\s+/g,'-').toLowerCase();
        if(slug === '' || slug===null)
        {
            slug=a;
            console.log('slug');
        }

    
       Pages.findOne( {slug:slug , _id:{$ne:id} }, async function(err,page){
            if(page){
                req.flash('danger','Slug already exists');
                res.redirect('/admin/pages');
                
            }
            else{
                await Pages.updateOne({_id: id},{title:title,slug:slug , content:content})
                Pages.find({}).sort({sorting: 1}).exec( function (err, pages) {
                    if (err) {
                        console.log(err);
                    } 
                    else {
                    req.app.locals.pages = pages;
                    }
                });
                req.flash('success','Page updated');
                   res.redirect('/admin/pages/edit-page/'+id);
               
               
            }
       })

    
});


/*
 Get delete page
*/
router.get('/delete-page/:id',isAdmin,  function (req,res) {
     Pages.findByIdAndRemove(req.params.id,function(err){
        if(err){
            console.log(err);
        }
        else{
            Pages.find({}).sort({sorting: 1}).exec( function (err, pages) {
                if (err) {
                    console.log(err);
                } 
                else {
                req.app.locals.pages = pages;
                }
            });
            req.flash('success','Page Deleted successfully ');
            res.redirect('/admin/pages');
        }
    });
});


//exports
module.exports=router;