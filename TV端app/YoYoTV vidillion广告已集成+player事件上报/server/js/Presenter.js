var Presenter = {
  //1
  makeDocument: function (resource) {
    if (!Presenter.parser) {
      Presenter.parser = new DOMParser();
    }
    var doc = Presenter.parser.parseFromString(resource, "application/xml");

//判断是否为search模板，如果是，注入keyboard.onTextChange方法
    var xx = Presenter.parser.parseFromString(doc.lastChild.innerHTML, "application/xml");
    var searchField = doc.getElementById("searchField"); //get the searchField element
    if (searchField) {
      var keyboard = searchField.getFeature("Keyboard");  // get the keyboard of the searchField
      keyboard.onTextChange = function () {    // register listener on event onTextChange
        console.log(keyboard.text);// do something with the current text
      };
    }
    return doc
  },

  //2
  modalDialogPresenter: function(xml){
    navigationDocument.presentModal(xml);
  },

  //3
  pushDocument: function(xml) {
    navigationDocument.pushDocument(xml);
  },

  //4
  popDocument: function() {
    navigationDocument.popDocument();
  },

  playAds: function (url) {

  //   var player = new Player();
  //   player.playlist = new Playlist();
  //  player.addEventListener("stateWillChange", function(event) {
  //      console.log('状态改变了');
  //      console.log("Event: " + event.type + "\ntarget: " + event.target + "\ntimestamp: " + event.timeStamp + "\noldState: " + event.oldState + "\nnew state: " + event.state);
  //  });
   //
  //  //  player.addEventListener("timeDidChange", function(event) {
  //  //    console.log("Event: " + event.type + "\ntarget: " + event.target + "\ntimestamp: " + event.timeStamp + "\ntime: " +  event.time + "\ninterval: " + event.interval);
  //  //  }, { interval: 10 });
   //
  //   player.playlist.push(new MediaItem('video', url));
  //   player.present();
  //   return;


    // var options1 = {'sid':'tst','uid':'BCC75567-77FD-4EDE-AD7E-0CF8C9F97091','cid':'pursuit99'}
    var options1 = {'sid':'cuu','uid':'UDID','cid':'tvios'}
    var sdk = new DAGJSTVOSSDK(options1);

    var playContent = function() {
      // var url = 'https://vidservercache-sjc.totalstream.net/99/mediafile.mp4?id=fc9872aa63b9cc9e5ba26ce06a906791b6e7ed8f&q=2';
      console.log('开始播这个了');
     // Using TVJS Player API
     var player = new Player();
     player.playlist = new Playlist();
     player.addEventListener('stateDidChange',function (event) {
       console.log('stateDidChange--' + '播放了多少时间：' + event.elapsedTime + '老状态' + event.oldState + '新状态' + event.state);
     });
     player.playlist.push(new MediaItem('video', url));
     player.present();
    };
    sdk.play(null,playContent);
  },

//点击某个item事件时，获取事件信息
  loadFilm: function(event) {
debugger
    //判断是否为policy或者term页面
    var currentEventIdName = event.target.getAttribute('id')
    if (currentEventIdName === 'PolicyBtn') {
      var doc = Presenter.makeDocument(DescriptiveAlertTemplate.policyTemplate());
      doc.addEventListener("select",Presenter.popDocument.bind(Presenter));
      navigationDocument.pushDocument(doc)
      return
    }
    if (currentEventIdName === 'TermBtn') {
      var doc = Presenter.makeDocument(DescriptiveAlertTemplate.termTemplate());
      doc.addEventListener("select",Presenter.popDocument.bind(Presenter));
      navigationDocument.pushDocument(doc)
      return
    }
    //判断是否需要支付
    if (localStorage.getItem('isPay') === 'true') {
      if (isPurchased()) {
        console.log('已经支付过了');
        Presenter.haveGotUrlToPlay(event)
      }else {
        pushNativeView()
        return
      }
    } else { //免费视频
      Presenter.haveGotUrlToPlay(event)
    }
  },

  haveGotUrlToPlay: function(event){
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

    //获取url并播放
    if (event) {
      playUrlIndex = Number(event.target.getAttribute('playUrlIndex'));
    }else {
      playUrlIndex = 0;
    }
    var str = localStorage.getItem('playUrlArray');
    var array = JSON.parse(str);
    videoURL = array[playUrlIndex];

    //如果是免费视频，则先播放广告，在将url传入播放广告的方法中去
    if (localStorage.getItem('isPay') === 'false') {
      Presenter.playAds(videoURL);
      return;
    }

    if(videoURL) {
      //2
      var player = new Player();
      player.addEventListener('stateDidChange',function (event) {
        console.log('stateDidChange--' + '播放了多少时间：' + event.elapsedTime + '老状态' + event.oldState + '新状态' + event.state);
      });
      var playlist = new Playlist();
      var mediaItem = new MediaItem("video", videoURL);

      player.playlist = playlist;
      player.playlist.push(mediaItem);
      player.present();
    }
  },

  loadProductPage: function(event){
debugger;
    var self = this,
    ele = event.target,
    title = ele.textContent;

    var doc = Presenter.makeDocument(ProductTemplate(title));
    doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
    Presenter.pushDocument(doc);
  },

  loadMenuItem(event) {
    const menuItemId = event.target.getAttribute('id');
    var doc;

    var jsstr = localStorage.getItem('homePage_bigStr')
    var json = JSON.parse(jsstr);
    switch (menuItemId) {
      case 'navigation_0':
        doc = Presenter.makeDocument(StackTemplate(json[0]));
        doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
        break;
      case 'navigation_1':
        doc = Presenter.makeDocument(StackTemplate(json[1]));
        doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
        break;
      case 'navigation_2':
        doc = Presenter.makeDocument(StackTemplate(json[2]));
        doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
        break;
      case 'navigation_3':
        doc = Presenter.makeDocument(CatalogTemplate());
        doc.addEventListener("select",Presenter.loadProductPage.bind(Presenter));
        // doc.addEventListener('select',Presenter.getRequest.bind(Presenter));
        break;
      case 'navigation_4':
        doc = Presenter.makeDocument(SearchTemplate());
        doc.addEventListener("select",Presenter.searchPresenter.bind(Presenter));
        break;
    }
    var menuItemDocument = event.target.parentNode.getFeature("MenuBarDocument");
    menuItemDocument.setDocument(doc, event.target);
  },

  //搜索
  searchPresenter(event){
    debugger
    var searchField = event.getElementsByTagName("searchField").item(0);
    var keyboard = searchField.getFeature("Keyboard");

    keyboard.onTextChange = function() {
      var searchText = keyboard.text;
      searchResults(document, searchText);
    }
  },

  getRequest(){
    var opts = {
      method: 'GET'
    }
    fetch('http://192.168.199.131:3000/genreLists', opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dataArr = JSON.parse(responseText);
      let doc = Presenter.makeDocument(ErrorAlertTemplate(dataArr[2].name ,'succ'));
      navigationDocument.pushDocument(doc);
    })
    .catch((error)=>{
      let doc = Presenter.makeDocument(ErrorAlertTemplate(error,'err'));
      navigationDocument.pushDocument(doc);
    })
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
    var isPay = event.target.getAttribute('isPay');

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
    localStorage.setItem('isPay',isPay);

    var doc = Presenter.makeDocument(Presenter.requestProductTemplate());
    Presenter.pushDocument(doc);
  },

//从首页进入更多 / 产品 页面
  homeCellClick :function(event) {
    isMore = event.target.getAttribute('isHaveMore');
    if (isMore) {
      var categoryID = event.target.getAttribute('categoryID');
      var categoryName = event.target.getAttribute('categoryName');
debugger
      localStorage.setItem('categoryName',categoryName);
      localStorage.setItem('categoryID',categoryID);
      localStorage.setItem('genre_id',genre_id);
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
      var isPay = event.target.getAttribute('isPay');

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
      localStorage.setItem('isPay',isPay);
debugger
      var doc = Presenter.makeDocument(Presenter.requestProductTemplate());
      Presenter.pushDocument(doc);
    }
  },

//获取首页的数据
  requestHomeTemplate () {
    var opts = {
      method: 'GET'
    }
    fetch('http://cdn.100uu.tv/index/?format=json&platform=apple-tv', opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dic = JSON.parse(responseText);
      var doc = Presenter.makeDocument(requestSuccess(dic));
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

//获取产品页数据
  requestProductTemplate () {
debugger
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

    var opts = {
      method: 'GET'
    }
    var description_url = 'http://cdn.100uu.tv/albums/' + albumID + '/?format=json&platform=apple-tv';
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
debugger
        var doc = Presenter.makeDocument(product_successTemplate(genre_id,description,dic));
        doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
        var currentNavIndex = navigationDocument.documents.length - 1;
        var loadingTem = navigationDocument.documents[currentNavIndex];
        Presenter.changeCurrentTemplate(loadingTem,doc);
      })
      .catch((error)=>{
        let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
        doc.addEventListener("select",Presenter.requestProductTemplate.bind(Presenter));
        var currentNavIndex = navigationDocument.documents.length - 1;
        var loadingTem = navigationDocument.documents[currentNavIndex];
        Presenter.changeCurrentTemplate(loadingTem,doc);
      })
    })
    .catch((error)=>{
      let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
      doc.addEventListener("select",Presenter.requestProductTemplate.bind(Presenter));
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
      var url = 'http://cdn.100uu.tv/albums/?format=json&genre=' + categoryID + '&page_size=1000&platform=apple-tv';
      //http://192.168.199.200:3000/episodes
debugger;
      var opts = {
        method: 'GET'
      }
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

    changeCurrentTemplate(exceptionalTem,doc){
      if (exceptionalTem.lastChild.outerHTML.indexOf('loadingTemplate') !== -1 || exceptionalTem.lastChild.outerHTML.indexOf('alertTemplate') !== -1) {
        navigationDocument.replaceDocument(doc,exceptionalTem);
      }
    },
}
