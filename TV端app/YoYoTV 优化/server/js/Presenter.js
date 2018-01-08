var Presenter = {
  //1 初始化资源模板
  makeDocument: function (resource) {
    if (!Presenter.parser) {
      Presenter.parser = new DOMParser();
    }
    var doc = Presenter.parser.parseFromString(resource, "application/xml");

//判断是否为search模板，如果是，注入keyboard.onTextChange方法
    var currentTemplate = Presenter.parser.parseFromString(doc.lastChild.innerHTML, "application/xml");
    var searchField = doc.getElementById("searchField");
    if (searchField) {
      var keyboard = searchField.getFeature("keyboard");
      keyboard.onTextChange = function () {
        console.log(keyboard.text);
      };
    }
    return doc;
  },

  //2 present模板
  modalDialogPresenter: function(xml){
    navigationDocument.presentModal(xml);
  },

  //3 push模板
  pushDocument: function (xml) {
    navigationDocument.pushDocument(xml);
  },

  //4 pop
  popDocument: function (xml) {
    navigationDocument.popDocument();
  },

  //点击某个item事件时，获取事件信息
  loadFilm: function(event) {
    //1
    if (event) {
      playUrlIndex = Number(event.target.getAttribute('playUrlIndex'));
    }else {
      playUrlIndex = 0;
    }
    var str = localStorage.getItem('playUrlArray');
    var array = JSON.parse(str);
    videoURL = array[playUrlIndex];

debugger
    //判断是否为简介按钮
    var product_description_btn_str = event.target.getAttribute('id');
    if (product_description_btn_str === 'product_description_btn') {
      var product_description = localStorage.getItem('product_description');
      var xml = `<?xml version="1.0" encoding="UTF-8" ?>
          <document>
            <alertTemplate>
              <description style="tv-text-max-lines:10">${product_description}</description>
            </alertTemplate>
          </document>`
      var doc = Presenter.makeDocument(xml);
      Presenter.modalDialogPresenter(doc);
      return ;
    }

    if(videoURL) {
      //2
      var player = new Player();
      var playlist = new Playlist();
      var mediaItem = new MediaItem("video", videoURL);

      player.playlist = playlist;
      player.playlist.push(mediaItem);
      player.present();
    }
  },

  //more页面进入产品页时的cell点击事件
  toProductFromMore : function (event) {
    var vimeoIDFromMorePage = event.target.getAttribute('vimeoID');
    var name = event.target.getAttribute('name');
    var director = event.target.getAttribute('director');
    var cast1 = event.target.getAttribute('cast1');
    var cast2 = event.target.getAttribute('cast2');
    var cast3 = event.target.getAttribute('cast3');
    var cast4 = event.target.getAttribute('cast4');
    var release_date = event.target.getAttribute('release_date');
    var launchImg = event.target.getAttribute('launchImg');
    var albumID = event.target.getAttribute('albumID');
    var vimeo_token = event.target.getAttribute('vimeo_token');
    var genre_id = event.target.getAttribute('genre_id');

    localStorage.setItem('product_vimeoID', vimeoIDFromMorePage);
    localStorage.setItem('product_name', name);
    localStorage.setItem('product_director', director);
    localStorage.setItem('product_cast1', cast1);
    localStorage.setItem('product_cast2', cast2);
    localStorage.setItem('product_cast3', cast3);
    localStorage.setItem('product_cast4', cast4);
    localStorage.setItem('product_release_date', release_date);
    localStorage.setItem('product_launchImg', launchImg);
    localStorage.setItem('product_albumID', albumID);
    localStorage.setItem('product_vimeo_token', vimeo_token);
    localStorage.setItem('genre_id',genre_id);

    var doc = Presenter.makeDocument(Presenter.requestProductTemplate());
    Presenter.pushDocument(doc);
  },

  //从首页进入更多 / 产品 页面
  homeCellClick :function(event) {
    isMore = event.target.getAttribute('isHaveMore');
    if (isMore) {
      var categoryID = event.target.getAttribute('categoryID');
      var categoryName = event.target.getAttribute('categoryName');
debugger;
      localStorage.setItem('categoryName',categoryName);
      localStorage.setItem('categoryID',categoryID);
      // localStorage.setItem('genre_id',genre_id);
      var resource = Presenter.requestMoreTemplate();
      var doc = Presenter.makeDocument(resource);
      Presenter.pushDocument(doc);
    }else {
      var name = event.target.getAttribute('name');
      var director = event.target.getAttribute('director');
      var cast1 = event.target.getAttribute('cast1');
      var cast2 = event.target.getAttribute('cast2');
      var cast3 = event.target.getAttribute('cast3');
      var cast4 = event.target.getAttribute('cast4');
      var release_date = event.target.getAttribute('release_date');
      var launchImg = event.target.getAttribute('launchImg');
      var vimeoID = event.target.getAttribute('vimeoID');
      var albumID = event.target.getAttribute('albumID');
      var vimeo_token = event.target.getAttribute('vimeo_token');
      var genre_id = event.target.getAttribute('genre_id');

      localStorage.setItem('product_name', name);
      localStorage.setItem('product_director', director);
      localStorage.setItem('product_cast1', cast1);
      localStorage.setItem('product_cast2', cast2);
      localStorage.setItem('product_cast3', cast3);
      localStorage.setItem('product_cast4', cast4);
      localStorage.setItem('product_release_date', release_date);
      localStorage.setItem('product_launchImg', launchImg);
      localStorage.setItem('product_vimeoID', vimeoID);
      localStorage.setItem('product_albumID', albumID);
      localStorage.setItem('product_vimeo_token', vimeo_token);
      localStorage.setItem('genre_id',genre_id);

      var doc = Presenter.makeDocument(Presenter.requestProductTemplate());
      Presenter.pushDocument(doc);
    }
  },

  //获取首页的数据
  requestHomeTemplate () {
    var opts = { method: 'GET' }
    fetch('http://47.93.83.7:8000/index/?format=json', opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dic = JSON.parse(responseText);
      var doc = Presenter.makeDocument(home_requestSuccess(dic));
      doc.addEventListener("select",Presenter.homeCellClick.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    .catch((error)=>{
      let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
      doc.addEventListener("select",Presenter.requestHomeTemplate.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    return LoadingTemplate();
  },

  //获取更多页面数据
  requestMoreTemplate () {
    var categoryID = localStorage.getItem('categoryID');
    var categoryName = localStorage.getItem('categoryName');
    var url = 'http://www.100uu.tv:8000/albums/?format=json&genre=' + categoryID + '&page_size=1000';
    var opts = { method: 'GET' }
    fetch(url, opts)
    .then((response)=>{
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      var albumArray = JSON.parse(responseText);
      var doc = Presenter.makeDocument(More.five(categoryName,albumArray.results));
      doc.addEventListener("select",Presenter.toProductFromMore.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    .catch((error)=>{
      let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
      doc.addEventListener("select",Presenter.requestMoreTemplate.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    return LoadingTemplate();
  },

  //获取产品页数据
  requestProductTemplate () {
    var vimeoID = localStorage.getItem('product_vimeoID');
    var token = localStorage.getItem('product_vimeo_token');
    var vimeo_token = 'Bearer ' + token;
    var albumID = localStorage.getItem('product_albumID');
    var genre_id = localStorage.getItem('genre_id');
    var eps_url ;
    if (genre_id === '3') {
      eps_url = 'https://api.vimeo.com/videos/' + vimeoID;
    }else {
      eps_url = 'https://api.vimeo.com/me/albums/' + vimeoID + '/videos?direction=desc&page=1&per_page=100';
    };

    var opts = { method: 'GET' }
    var description_url = 'http://www.100uu.tv:8000/albums/' + albumID + '/?format=json';
    fetch(description_url, opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dic = JSON.parse(responseText);
      var description = dic.description;
      localStorage.setItem('product_description',description);
//嵌套一层请求
      var headers = new Headers({
        'cacheHeaderValue' : 'no-cache',
        'Authorization' : vimeo_token
      });
      var request = new Request(eps_url,{headers:headers});
      fetch(request)
      .then((response)=>{
        return response.text(); //返回一个带有文本的对象
      })
      .then((responseText)=>{
        var dic = JSON.parse(responseText);
        var doc = Presenter.makeDocument(product_requestSuccessTemplate(genre_id,description,dic));
        doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
        var currentNavIndex = navigationDocument.documents.length - 1;
        var loadingTem = navigationDocument.documents[currentNavIndex];
        Presenter.changeCurrentTemplate(loadingTem,doc);
      })
      .catch((error)=>{
        var doc = Presenter.makeDocument(ErrorAlertTemplate(error));
        doc.addEventListener("select",Presenter.requestProductTemplate.bind(Presenter));
        var currentNavIndex = navigationDocument.documents.length - 1;
        var loadingTem = navigationDocument.documents[currentNavIndex];
        Presenter.changeCurrentTemplate(loadingTem,doc);
      })
    })
    .catch((error)=>{
      var doc = Presenter.makeDocument(ErrorAlertTemplate(error));
      doc.addEventListener("select",Presenter.requestProductTemplate.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    return LoadingTemplate();
  },

  changeCurrentTemplate(exceptionalTem,doc){
    if (exceptionalTem.lastChild.outerHTML.indexOf('loadingTemplate') !== -1 || exceptionalTem.lastChild.outerHTML.indexOf('alertTemplate') !== -1) {
      navigationDocument.replaceDocument(doc,exceptionalTem);
    }
  },

}
