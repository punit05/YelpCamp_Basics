var express=require("express");
var app=express();
var flash=require("connect-flash");
var bodyparser=require("body-parser");
var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var methodOverride=require("method-override");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");
var seedDB=require("./seeds");

//var commentRoutes=require("./routes/comments");
//var campgroundRoutes=require("./routes/campgrounds");
//var indexRoutes=require("./routes/index");
//seedDB();//seed the databse
mongoose.connect("mongodb://localhost/yelp_camp");
    
app.use(require("express-session")(
    {
        secret:"IT IS HARD",
        resave:false,
        saveuninitialized:false
    }));
    app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set("view engine" ,"ejs"); 
app.use(express.static(__dirname + "/public"));
//this is the  middleware for the currentuser we have to include that current user in every route

app.use(function(req,res,next)
{
    res.locals.currentUser=req.user;
    res.locals.error=req.flash("error");
     res.locals.success=req.flash("success");
    
    next();
});

app.use(bodyparser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.get("/campgrounds",function(req,res)
{
   //get all campgrounds from db
   Campground.find({},function(err,allCampgrounds)
   {
       if(err)
       {
           console.log(err);
       }
       {
     res.render("index",{campgrounds_ejs:allCampgrounds,currentUser:req.user});//req.user will have the name of the user who is logged in      
       }
   })
   //
});
 app.post("/campgrounds",isLoggedIn,function(req,res)
{
    //get data from form and add
    
    
    var name=req.body.name;
    var price=req.body.price;
    var image=req.body.image;
    var desc=req.body.description;
    
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newcampground={name:name,price:price,image:image,description:desc,author:author};
   // campgrounds.push(newcampground);
    Campground.create(newcampground,function(err,newlycreated)
    {
       if(err)
       {
           console.log(err);
       }
       else 
       {
           res.redirect("/campgrounds");
       }
    });
    
   
});
 app.get("/campgrounds/new" ,isLoggedIn,function(req,res)
{
    res.render("new");
});
 app.get("/campgrounds/:id",function(req,res)
{
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground)
    {
        if(err)
        {
            console.log(err);
        }
        else 
        {
            res.render("show",{
                campground:foundCampground
            });
        }
        
    });
    
    
    

});
//Edit campground Route

app.get("/campgrounds/:id/edit",checkCampgroundOwnership,function(req, res) {
            Campground.findById(req.params.id,function(err, foundCampground)
            {
                res.render("edit",{campground:foundCampground});
            });

//   check first if user logged in if logged in thendoes user own the campground if both the case then hold good otherise rdiect somewhere
 //if user loged in
  
   
   
});  
//update campground
   app.put("/campgrounds/:id",checkCampgroundOwnership,function(req,res)
   {
       //we have group image name descr in one campground in edit form so that we can use them all together
       
       
       Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground)
       {
           if(err)
           {
               res.redirect("/campgrounds");
           }
           else 
           {
               res.redirect("/campgrounds/" + req.params.id);
           }
       });
   });

   //Destroy campground route
   app.delete("/campgrounds/:id",checkCampgroundOwnership,function(req,res)
   {
       Campground.findByIdAndRemove(req.params.id,function(err)
       {
           
           if(err)
           {
           res.redirect("/campgrounds");
       }
       else 
       {
           res.redirect("/campgrounds");
       }
       
   });
   
});


//=======comments routes======

app.get("/campgrounds/:id/comments/new", isLoggedIn,function(req,res)
{
    Campground.findById(req.params.id,function(err,campground)
    {
        if(err)
        {
            console.log(err);
        }
        else 
        {
            res.render("new_comments",{campground:campground
            });
        }
    });
//    res.render("new_comments");
});
app.post("/campgrounds/:id/comments",isLoggedIn ,function(req,res)//here we are putting isloggedin to prevent everyone from writing a comment if we send a post request in postman it will let us type the comment
{
    //res.redirect("/campgrounds");
    //console.log("HI");
    //lookup campground using id
    Campground.findById(req.params.id,function(err,campground)
    {
        if(err)
        {
            console.log(err);
            res.redirect("/campgrounds");
        }
        else 
        {
            //this req.body.comment has 2 pieces already your author and comment because we have declared an array int the name feld in new_comment.ejs
            //console.log("YEs");
            Comment.create(req.body.comment,function(err,comment)
            {
                if(err)
                {
                    req.flash("error","Something Went Wrong");
                    console.log(err);
                }
                else {
                    comment.author.id=req.user._id;
                    comment.author.username=req.user.username;
                    comment.save();
                   // console.log(req.user.username);
                    
                    
                    //console.log(comment);
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("succes","successfully created comment");
                    res.redirect('/campgrounds/' + campground._id);
                    
                }
            })    ;
        }
    });
    //create new comment
    //connect new 
});

//edit a comment 
app.get("/campgrounds/:id/comments/:comment_id/edit",checkCommentOwnership,function(req, res) {
    Comment.findById(req.params.comment_id,function(err,foundComment)
    {
        if(err)
        {
            res.redirect("back");
        }
        else 
        {
              res.render("edit_comment",{campground_id:req.params.id,comment:foundComment});          
        }
    });
  
});

   //update route
   app.put("/campgrounds/:id/comments/:comment_id",checkCommentOwnership,function(req,res)
   {
       Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment)
       {
           if(err)
           {
               res.redirect("back");
           }
           else 
           {
               res.redirect("/campgrounds/" + req.params.id);
           }
       });
   });
   //Delete route
app.delete("/campgrounds/:id/comments/:comment_id",checkCommentOwnership,function(req,res)
{
   Comment.findByIdAndRemove(req.params.comment_id,req.body.comment,function(err,deletedComment)
       {
           if(err)
           {
               res.redirect("back");
           }
           else 
           {
               req.flash("success","comment deleted");
               res.redirect("/campgrounds/" + req.params.id);
           }
       });
   
    
});
   
    //AUTH ROUTES
    
    app.get("/",function(req,res)
{
    res.render("landing");
});


app.get("/register",function(req, res) {
        res.render("register");
    });
    
    //in register before authenctication we are ,a making a new user and then we are authentciatng and whereas in login we are notmaking and newuser we are just authenticating user is presumed to exist alreayd
    
app.post("/register",function(req, res) {
    var newUser=new User({username:req.body.username});
   User.register(newUser,req.body.password,function(err,user)
   {
       if(err)
       {
         //  console.log(err);
           req.flash("error",err.message);
          return res.render("register");
       }
       passport.authenticate("local")(req,res,function()
       {
           req.flash("success","Welcome to Yelpcamp" + user.username);
           res.redirect("/campgrounds");
       });
   }) ;  //user.registen is provided by passportlocalmangoose package
});
app.get("/login",function(req, res) {
    res.render("login");

    
});
//we have to use the concept of middle ware for loin that's why we put in between the callbacks about the mddlewarelogic;
app.post("/login", passport.authenticate("local",
{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
}),
    function(req, res) {
   
});
app.get("/logout",function(req, res) {
    req.logout();
    req.flash("success","Logged You Out");
    res.redirect("/campgrounds");
});

function checkCampgroundOwnership(req,res,next)
{
    if(req.isAuthenticated())
  {
      //another if statement for 
        Campground.findById(req.params.id,function(err, foundCampground)
            {
                
            if(err)
            {
                req.flash("error","campground not found");
               res.redirect("back");
            }
            else
        {
           //does user own the campground
           //we can't just use double equal of triple equal to see if they are equal because campgound id is a object and another one is tring they look identical but they are not so what we nee dto do is we need a mnagoose method is equal to see if they are equal
           if(foundCampground.author.id.equals(req.user._id))
           {
          next();//becaue we don't a;ways have to edit sometie we have to update and delete that's why we use nect in our middleware     
           }
           else 
           {
               req.flash("error","you don't have Permission to do that");
               
               res.redirect("back");
           }
           
       }
   });
   
  }
  else 
  {
      req.flash("error","you need to be logged in to do that");
      res.redirect("back");
  }
   
}
function checkCommentOwnership(req,res,next)
{
    if(req.isAuthenticated())
  {
      //another if statement for 
        Comment.findById(req.params.comment_id,function(err, foundComment)
            {
            if(err)
            {
               res.redirect("back");
            }
            else
        {
           //does user own the campground
           //we can't just use double equal of triple equal to see if they are equal because campgound id is a object and another one is tring they look identical but they are not so what we nee dto do is we need a mnagoose method is equal to see if they are equal
           if(foundComment.author.id.equals(req.user._id))
           {
          next();//becaue we don't a;ways have to edit sometie we have to update and delete that's why we use nect in our middleware     
           }
           else 
           {
               req.flash("error","You don't have Permisssion to do that");
               res.redirect("back");
           }
           
       }
   });
   
  }
  else 
  {
      req.flash("error","you need to be logged in to do that");
      res.redirect("back");
  }
}

function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    req.flash("error","Please Log in first");
    res.redirect("/login");
}
    
app.listen(process.env.PORT,process.env.IP,function()
{
    console.log("YelpCamp ha started");
});