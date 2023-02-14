require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rishabh:"+process.env.PASSWORD+"@cluster0.ds4epev.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);
let day;
app.get("/", function (req, res) {

    var today = new Date();

    var options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    day = today.toLocaleDateString("en-US", options);

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully saved dafault items to DB. ");
                }
            });
            res.redirect("/");   
        } else {
            res.render("list", { kindOfDay: day, newListItems: foundItems });
        }
       
    });

});

app.get("/:customListName", function(req, res){
    // console.log(req)

    console.log(req.params)
    const customListName = req.params.customListName;
    console.log(customListName);
    List.findOne({name: customListName}, function(err, foundList){
        if(!err) {
            if(!foundList){
                //Create A new list
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);

            } else{
               //Show an Existing list
               res.render("list",{ kindOfDay: foundList.name, newListItems: foundList.items });
            }
        }
    });

});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    console.log(listName);
    console.log(itemName);

    const item = new Item({
        name: itemName
    });

    if (listName === day) {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){
            console.log(foundList);
            foundList.items.push(item);
            foundList.save();
             res.redirect("/" + listName);
        });
    }

});

app.post("/delete",function(req, res){
    const checkItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === day) {
        Item.findByIdAndRemove(checkItemId, function(err){
            if(!err) {
                console.log("Successfully deleted checked item");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}, function(err,foundList){
            if(!err) {
                res.redirect("/" + listName);
            } 
        });
    }

});

// app.get("/Work", function (req, res) {
//     res.render("list", { kindOfDay: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
    res.render("about");
});

// app.post("/work", function(req,res){
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});
