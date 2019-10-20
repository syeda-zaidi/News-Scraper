const axios = require("axios");
const db = require("../models/index");
const cheerio = require("cheerio");

module.exports = app => {

    //return json for all saved articles 
    app.get("/articles-json", function (req, res) {

        db.Articles.find({})
            .then(function (dbArticles) {
                res.json(dbArticles);
            }).catch(function (err) {
                res.json(err);
            });
    });

    app.get("/articles-json/:id", function (req, res) {
        db.Articles.findOne({ _id: req.params.id })
            .populate("Notes")
            .then(function (dbArticles) {
                res.json(dbArticles)
            }).catch(function (err) {
                res.json(err);
            });
    });

    //updates the article for saving it
    app.put("/saved/:id", function (req, res) {
        ab.Articles.findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
            .then(function (savedArticle) {
                res.sendStatus(200);
                console.log("article saved : " + savedArticle);

            }).catch(err => {
                console.log(err);
                res.sendStatus(500);
            });
    });


    
// scrapes new articles and saves in db
app.get("/scrape", function (req, res) {

    axios.get("https://www.latimes.com").then(function (response) {
  
      const $ = cheerio.load(response.data);
  
      $(".PromoSmall-content").each(function (i, element) {
        var result = {};
  
        result.title = $(this).children(".PromoSmall-titleContainer").children(".PromoSmall-title").children("a").text();
        result.link = $(this).children(".PromoSmall-titleContainer").children(".PromoSmall-title").children("a").attr("href");
        result.description = $(this).children(".PromoSmall-description").text();
          console.log(result)
  
          if (result.title && result.link && result.description){
            db.Articles.create(result).then(function (dbArticles) {
          
            }).catch(function (err) {
              console.log(err);
            });
          }
      });
  
      res.send("scrape complete");
    });
  });
  
  app.get("/", function (req, res) {
    
    db.Articles.find({}).then(function (dbArticles) { 
      console.log(dbArticles);
    
      res.render("index", {data: dbArticles} )
    }).catch(function (err) {
        if (err){
            console.log(err);
            res.sendStatus(500);
        };
    });
  });
  
  
  app.get("/saved", function (req, res) {
      db.Articles.find({ saved: true })
      .then(function (dbArticles) {
          res.render("index", {data: dbArticles});
      })
      .catch((err) => {
        console.log(err);
      });
  });
  
  
  // creating and saving note associate to article
  app.post("/articles/:id", function (req, res) {
  
    db.Notes.create(req.body)
  
      .then(function (dbNote) {
        return db.Articles.findOneAndUpdate({ _id: req.params.id }, { Notes: dbNote._id }, { new: true });
      })
      .then(function (dbArticles) {
        res.json(dbArticles); 
      })
      .catch(function (err) {
        //sends err to the client 
        res.json(err);
  
      })
  });
  
  // removes all articles 
  app.get("/clear", function (req, res) {
    db.Articles.remove({}, function (err, res) {
      if (err) {
        console.log(err);
      } else {
        console.log("cleared all articles");
      }
    });
    res.redirect("/articles-json");
  });



}

     