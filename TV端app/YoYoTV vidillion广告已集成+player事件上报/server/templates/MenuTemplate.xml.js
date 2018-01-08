

var MenuTemplate = function () {
  requestTabData();
  return LoadingTemplate();
}

var requestTabData = function () {

  var opts = {
    method: 'GET'
  }
  fetch('http://192.168.199.131:3000/genreLists', opts)
  .then((response) => {return response.text()})
  .then((responseText)=>{
    let array = JSON.parse(responseText);
    var doc = Presenter.makeDocument(successTemplate(array));
    doc.addEventListener("select",Presenter.loadMenuItem.bind(Presenter));
    navigationDocument.clear();
    Presenter.pushDocument(doc);
  })
  .catch((error)=>{
debugger
    let doc = Presenter.makeDocument(ErrorAlertTemplate(error,'errxxx'));
    Presenter.pushDocument(doc);
    // Presenter.replaceDocument(doc,loadingDoc);
  })
}

var successTemplate = function (array) {
  var doc = `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
    <menuBarTemplate>
     <menuBar>
       ${itemForBar(array)}
     </menuBar>
    </menuBarTemplate>
  </document>`
  return doc;
}

var itemForBar = function (array) {
  let str = JSON.stringify(array);
  localStorage.setItem('homePage_bigStr', str)

  let cellTemplate = [];
  array.map((cellData, index) => {
    cellTemplate.push(`
        <menuItem id="navigation_${index}" data-identifier="homePage">
           <title>${cellData.name}</title>
        </menuItem>
    `)
  });
  return cellTemplate.join('');
}


//原版
var MenuTemplate1 = function () {
  return `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
    <menuBarTemplate>
     <menuBar>
        <menuItem id="navigation_home" data-identifier="homePage">
           <title>HomePage</title>
        </menuItem>
        <menuItem id="navigation_loading" data-identifier="loadingPage">
           <title>loadingPage</title>
        </menuItem>
        <menuItem id="navigation_search" data-identifier="searchPage">
           <title>SearchPage</title>
        </menuItem>
     </menuBar>
    </menuBarTemplate>
  </document>`
}
