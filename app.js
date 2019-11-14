var express=require('express');
var path=require('path');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var session =require('express-session');
var app=express();
var expressValidator=require('express-validator');
var fileUpload=require('express-fileupload');
var passport=require('passport');

var cookieParser = require('cookie-parser')
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//set global errors variable
app.locals.errors=null;

//Get Page Model
var Schema=require('./models/page');
var Page= mongoose.model("Pages",Schema);

//get all pages to pass header.ejs
    Page.find({}).sort({sorting: 1}).exec(async function (err, pages) {
                        if (err) {
                            console.log(err);
                        } 
                        else {
                           app.locals.pages = pages;
                        }
                    });
 
     //get category model                
      var Schema1=require('./models/category');
      var Category= mongoose.model("categories",Schema1);
      
      //get all pages to pass header.ejs
      Category.find( async function (err, categories) {
          if (err) {
              console.log(err);
          } 
          else {
             app.locals.categories = categories;
          }
      });
                    


      //cookie-parser
      app.use(cookieParser())

//express fileupload middleware
app.use(fileUpload());

//body parser 
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

//express session 
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

//express messages 
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport config
require('./config/passport')(passport);
// passport 
app.use(passport.initialize());
app.use(passport.session());


app.get('*',async function(req,res,next){
    res.locals.cart=req.session.cart;
    res.locals.user=req.user||null;
    next();
})


//set routes
var pages=require('./routes/pages.js');
var products=require('./routes/products.js');
var cart=require('./routes/cart.js');
var users=require('./routes/users.js');
var adminPages=require('./routes/admin_pages.js');
var adminCategories=require('./routes/admin_categories.js');
var adminProducts=require('./routes/admin_products.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);


//giving the port number 
var port=8000;
app.listen(port,function(){
    console.log('server listening on ' +port  );
})