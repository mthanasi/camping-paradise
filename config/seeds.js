var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

var data = [
  {
    name: "Cloud's Rest",
    image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
    description:
      "Clouds Rest is a mountain in Yosemite National Park east northeast of Yosemite Village, California. Although there are many peaks in the park having far greater elevation, Clouds Rest's proximity to the valley gives it a very high degree of visual prominence. The summit can be reached by a 7.2-mile (11.6 km) trail hike from Tioga Pass Road or a 13-mile (21 km) trail hike from Happy Isles by way of Little Yosemite Valley. There are also several technical routes available.",
    author: {
      id: "588c2e092403d111454fff76",
      username: "Jack Grant",
    },
    price: 20,
  },
  {
    name: "Desert Mesa",
    image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
    description:
      "Desert Mesa Camping in Yvette M.'s Land, California | Sleep under the Milky Way while camping on our property at our 2 acre private residence in the desert.",
    author: {
      id: "588c2e092403d111454fff71",
      username: "Anna Mendez",
    },
    price: 45,
  },
  {
    name: "Canyon Floor",
    image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
    description:
      "The National Park Service operates developed campgrounds on the north and south rims of the Grand Canyon and allows backcountry camping on the rims and the canyon floor. Developed campgrounds have tent sites or parking pads for RVs and limited hookups. If you’re backpacking, you don’t have to stay in one of the campgrounds on the canyon floor, but all campers, including those staying at Bright Angel, Cottonwood and Indian Garden campgrounds require backcountry permits.",
    author: {
      id: "588c2e092403d111454fff77",
      username: "Jane Hale",
    },
    price: 39,
  },
  {
    name: "Acadia Main",
    image:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170",
    description:
      "Located on Mount Desert Island, Acadia National Park is the Pine Tree State's natural jewel. The park boasts 17 million acres of forest, 6,000 lakes and ponds, and 32,000 miles of rivers and streams to offer a scenic backdrop to your hiking and camping. ",
    author: {
      id: "588c2e092403d111454fff77",
      username: "Jane Hale",
    },
    price: 63,
  },
  {
    name: "White Mountain National Forest",
    image:
      "https://images.unsplash.com/photo-1570979999611-fbaa81176bfd?crop=entropy&cs=tinysrgb&fm=jpg&ixlib=rb-1.2.1&q=80&raw_url=true&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1175",
    description:
      "If you're looking for a rugged hike, look no further than this northernmost part of the Appalachian Valley. The sights are particularly magical in the fall when leaf-peeping season is at its peak. Plus, the forest has several campgrounds with a combined hundreds of campsites. Currently, several campgrounds, climbing areas, and shelters remain closed.",
    author: {
      id: "588c2e092403d111454fff77",
      username: "Anna Mendez",
    },
    price: 120,
  },
];

function seedDB() {
  //Remove all campgrounds
  Campground.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    }
    console.log("removed campgrounds!");

    Review.deleteMany({}, function (err) {
      if (err) {
        console.log(err);
      }
      console.log("removed reviews!");
    });

    Comment.deleteMany({}, function (err) {
      if (err) {
        console.log(err);
      }
      console.log("removed comments!");
      //add a few campgrounds
      data.forEach(function (seed) {
        Campground.create(seed, function (err, campground) {
          if (err) {
            console.log(err);
          } else {
            console.log("added a campground");
            //create a comment
            Comment.create(
              {
                text: "This place is great, but I wish there was internet",
                author: {
                  id: "588c2e092403d111454fff76",
                  username: "Jack Grant",
                },
              },
              function (err, comment) {
                if (err) {
                  console.log(err);
                } else {
                  campground.comments.push(comment);
                  campground.save();
                  console.log("Created new comment");
                }
              }
            );
          }
        });
      });
    });
  });
}

module.exports = seedDB;
