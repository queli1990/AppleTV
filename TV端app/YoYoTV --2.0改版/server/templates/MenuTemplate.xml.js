var MenuTemplate = function () {
  requestTabData();
  return LoadingTemplate();
}

var requestTabData = function () {
debugger
  var opts = { method: 'GET' }
  fetch('http://cdn.100uu.tv/index2/?format=json&platform=apple-tv', opts)
  .then((response) => {return response.text()})
  .then((responseText)=>{
    let array = JSON.parse(responseText);
    var doc = Presenter.makeDocument(successTemplate(array.genres));
    doc.addEventListener("select",Presenter.selectMenuItem.bind(Presenter));
    navigationDocument.clear();
    Presenter.pushDocument(doc);
  })
  .catch((error)=>{
    let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
    doc.addEventListener('select',requestTabData);

    var currentNavIndex = navigationDocument.documents.length - 1;
    var loadingTem = navigationDocument.documents[currentNavIndex];
    Presenter.changeCurrentTemplate(loadingTem,doc);
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
