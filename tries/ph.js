var page = require('webpage').create();
page.open("file:///" + "C:/Users/Cheto/Desktop/clone/build" + "/index.html", function(status) {
  
  var content = page.content;
  console.log('++++', content);
  console.log("Status: " + status);
  if(status === "success") {
    page.render('example.png');
  }
  // phantom.exit();
});