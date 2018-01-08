App.onLaunch = function (options){
  BASEURL = options.BASEURL;

  var javascriptFiles = [
    `${options.BASEURL}js/fetch-polyfill.js`,
    `${options.BASEURL}js/Presenter.js`,
    `${options.BASEURL}js/ResourceLoader.js`,

    `${options.BASEURL}templates/ErrorAlertTemplate.xml.js`,
    `${options.BASEURL}templates/LoadingTemplate.xml.js`,
    `${options.BASEURL}templates/ProductTemplate.xml.js`,
    `${options.BASEURL}templates/HomeTemplate.xml.js`,
    `${options.BASEURL}templates/More.xml.js`,
  ];

  evaluateScripts(javascriptFiles, function(success){
    localStorage.setItem('more_page_categoryName','');
    if (success) {
      resourceLoader = new ResourceLoader(options.BASEURL);
      resourceLoader.loadResource(`${options.BASEURL}templates/HomeTemplate.xml.js`, function(resource){
        var doc = Presenter.makeDocument(resource);
        Presenter.pushDocument(doc);
      });
    } else {
      var title = "Resource Loader Error";
      description = `Error loading resource. \n\n Try again later.`;
      var alert = createLoadingFileFailAlert(title, description);
      navigationDocument.pushDocument(alert);
    }
  });
}

var createLoadingFileFailAlert = function (title, description) {
  var alertString = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <alertTemplate>
        <title>${title}</title>
        <description>${description}</description>
        <button>
          <text>OK</text>
        </button>
      </alertTemplate>
    </document>
  `
  var parser = new DOMParser();
  var alertDoc = parser.parseFromString(alertString, "application/xml");
  return alertDoc
}
