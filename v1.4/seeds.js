var mongoose=require("mongoose");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var data=[
    {
        name:"cloud's rest",
        image:"https://pixabay.com/get/e03db50f2af41c22d2524518b7444795ea76e5d004b0144291f4c77fa3ecb5_340.jpg",
        description:"blah blah blah"
    },
    {
        name:"Desert",
        image:"https://pixabay.com/get/e837b1072af4003ed1584d05fb1d4e97e07ee3d21cac104496f4c57fa1e9b4b8_340.jpg",
        description:"lollololo"
    },
    {
        name:"DDDDD",
        image:"https://pixabay.com/get/e835b20e29f0003ed1584d05fb1d4e97e07ee3d21cac104496f4c57fa1e9b4b8_340.jpg",
        description:"CDFVFVFV"
    }
    
    
    
    ]
function seedDB()
{
    //Remove all campground
    Campground.remove({},function(err)
{
    if(err)
    {
        console.log(err);
    }
    else 
    
    console.log("removed campgrounds!");

         data.forEach(function(seed)
    {
     Campground.create(seed,function(err,campground){
         if(err)
         {
             console.log(err);
         }
         else 
         {
             console.log("added a campground");
             //create a comment
             Comment.create(
                 {
                     text:"this place is great",
                     author:"Homer"
                 }, function(err,comment)
                 {
                     if(err)
                     {
                         console.log(err);
                     }
                     else 
                     {
                    campground.comments.push(comment);
                    campground.save();
                     console.log("created new comment");
                         
                     }
                 });
             
         }
     });   
    });
    
    });

}    // add a few campgrounds
   

module.exports=seedDB;