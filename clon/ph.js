var page = require('webpage').create();
page.open("http://localhost:5000/", function(status) {
  console.log("Status: " + status);
    page.render('google.png');
    page.refresh();
    // phantom.exit();
});