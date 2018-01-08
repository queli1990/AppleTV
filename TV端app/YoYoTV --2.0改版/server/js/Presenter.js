
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

//点击某个item事件时，获取事件信息
  loadFilm: function(event) {
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
    if (currentEventIdName === 'related') {
      Presenter.homeCellClick(event);
      return
    }
    //判断是否需要支付
    if (localStorage.getItem('isPay') === 'true') {
      if (isPurchased()) {
        console.log('has paid');
        // Presenter.haveGotUrlToPlay(event)
      }else {
        pushNativeView()
        return
      }
    }
    Presenter.haveGotUrlToPlay(event)
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
      var playUrlIndex = Number(event.target.getAttribute('playUrlIndex'));
      localStorage.setItem('playUrlIndex',playUrlIndex+1);
    }else {
      playUrlIndex = 0;
      localStorage.setItem('playUrlIndex',playUrlIndex+1);
    }
    var str = localStorage.getItem('playUrlArray');
    var array = JSON.parse(str);
    videoURL = array[playUrlIndex];

    if(videoURL) {
      //2
      var player = new Player();
      var playlist = new Playlist();
      var mediaItem = new MediaItem("video", videoURL);
      player.addEventListener('stateDidChange',function (event) {
             console.log('stateDidChange--' + '播放了多少时间：' + event.elapsedTime + '老状态' + event.oldState + '新状态' + event.state);
             if (event.state === 'begin') {
               let beginTime = (Presenter.date2str(event.timeStamp,"yyyy-MM-dd hh:mm:ss"));
               localStorage.setItem('beginTime',beginTime);
             }
             if (event.state === 'end') {
               let userIP = localStorage.getItem("IP");
               let albumID = localStorage.getItem('product_albumID');
               let name = localStorage.getItem('product_name')+'--'+localStorage.getItem('playUrlIndex');
               var playedTime = Math.floor(event.elapsedTime*1000);
               //后台接受字段不能为0
               if (playedTime == 0) {
                 if (event.oldState == 'playing') {
                   playedTime == 3*60*60*1000;
                 }
                 if (event.oldState == 'begin') {
                   playedTime = 1;
                 }
               }
               let endTime = (Presenter.date2str(event.timeStamp,"yyyy-MM-dd hh:mm:ss"));
               let beginTime = localStorage.getItem('beginTime');
               postActive(userIP,albumID,name,playedTime,beginTime,endTime);
             }
           });
      player.playlist = playlist;
      player.playlist.push(mediaItem);

      if (localStorage.getItem('isPay') === 'true') {
        //只有会员可以播放，所以不需要广告
        player.present();
      } else {
        //播放广告
        var url = 'https://m.spotx.tv/tvos/v2/sdk.js';
        evaluateScripts([url], function (success) {
          if (success) {
            var params = { 'secure' : '1' };
            SpotX.load("85394", params, function (err, adPlayer) {
                // AD_EVENTS.forEach(function (event) {
                //     adPlayer.addEventListener(event, function () {
                //         console.log("Ad Event = " + event);
                //         if (null != eventCallback) {
                //             eventCallback(event);
                //         }
                //     });
                // });
                adPlayer.preRoll(player);
                player.play();
            });
          }
          else {
            var alert = createAlert("SpotX SDK Load Error",
                "A problem occurred while attempting to load the SpotX SDK for TVOS.\n\nPlease try again later.");
            navigationDocument.presentModal(alert);
          }
        });
      }
    }
  },

  date2str(x,y) {
    var z ={y:x.getFullYear(),M:x.getMonth()+1,d:x.getDate(),h:x.getHours(),m:x.getMinutes(),s:x.getSeconds()};
    return y.replace(/(y+|M+|d+|h+|m+|s+)/g,function(v) {return ((v.length>1?"0":"")+eval('z.'+v.slice(-1))).slice(-(v.length>2?v.length:2))});
  },

  selectMenuItem(event) {
    const menuItemId = event.target.getAttribute('id');
    var doc;
    var jsstr = localStorage.getItem('homePage_bigStr')
    var json = JSON.parse(jsstr);
    for (var i = 0; i < json.length; i++) {
      let currentID = `navigation_${i}`
      if (menuItemId === currentID) {
        localStorage.setItem('nav_id',json[i].id);
        let doc = Presenter.makeDocument(Presenter.requestHomeTemplate(event));
        var menuItemDocument = event.target.parentNode.getFeature("MenuBarDocument");
        menuItemDocument.setDocument(doc, event.target);
      }
    }
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

//more页面进入产品页时的cell点击事件
  toProductFromMore : function (event) {
    var vimeoIDFromMorePage = event.target.getAttribute('vimeoID');
    var name = event.target.getAttribute('name');
    if (name.indexOf("&") != -1) {
      name = name.replace(/&/,"&amp;");
    }
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
    let isActivity = event.target.getAttribute('isActivity');
    if (isActivity == "true") {
      earnMoney();
      return;
    };

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
    } else {
      var name = event.target.getAttribute('name');
      if (name.indexOf("&") != -1) {
        name = name.replace(/&/,"&amp;");
      }
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
      var doc = Presenter.makeDocument(Presenter.requestProductTemplate());
      Presenter.pushDocument(doc);
    }
  },

  getUserIP () {
    var opts = { method: 'GET' }
    var requestUrl = 'http://pv.sohu.com/cityjson?ie=utf-8';
    fetch(requestUrl, opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      console.log(responseText);
      //正则
      var myRe = new RegExp("((?:(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d)))\\.){3}(?:25[0-5]|2[0-4]\\d|((1\\d{2})|([1-9]?\\d))))","gi");
      // var myRe = new RegExp("/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/","gi");
      let reStr = myRe.exec(responseText);
      let currentUserIP = reStr[0];
      localStorage.setItem('IP',currentUserIP);
      livenessUser(currentUserIP);
    })
    .catch((error)=>{
      console.log('fail' + error);
    })
  },

//获取首页的数据
  requestHomeTemplate (selectMenuItemEvent) {
    var opts = {
      method: 'GET'
    }
    let id = localStorage.getItem('nav_id');
    let url = `http://cdn.100uu.tv/genres/${id}/?format=json&platform=apple-tv`
    fetch(url, opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dic = JSON.parse(responseText);
      var doc = Presenter.makeDocument(requestSuccess(dic));
      doc.addEventListener("select",Presenter.homeCellClick.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      // Presenter.changeCurrentTemplate(loadingTem,doc);
      var menuItemDocument = selectMenuItemEvent.target.parentNode.getFeature("MenuBarDocument");
      menuItemDocument.setDocument(doc, selectMenuItemEvent.target);
      Presenter.getUserIP();
    })
    .catch((error)=>{
      let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
      // doc.addEventListener("select",Presenter.requestHomeTemplate.bind(Presenter));
      // var currentNavIndex = navigationDocument.documents.length - 1;
      // var loadingTem = navigationDocument.documents[currentNavIndex];
      // Presenter.changeCurrentTemplate(loadingTem,doc);
      doc.addEventListener('select',function(e){
        Presenter.requestHomeTemplate(selectMenuItemEvent);
      });
      var menuItemDocument = selectMenuItemEvent.target.parentNode.getFeature("MenuBarDocument");
      menuItemDocument.setDocument(doc, selectMenuItemEvent.target);
    })
    return LoadingTemplate();
  },

//获取产品页数据
  requestProductTemplate () {
    var albumID = localStorage.getItem('product_albumID');
    var opts = { method: 'GET' }
    var description_url = 'http://cdn.100uu.tv/albums/' + albumID + '/?format=json&platform=apple-tv';
    fetch(description_url, opts)
    .then((response) => {
      return response.text(); //返回一个带有文本的对象
    })
    .then((responseText)=>{
      let dic = JSON.parse(responseText);
      var description = dic.description;
      localStorage.setItem('product_description',description);
      //请求相关推荐，并将description传过去
      Presenter.relatedRequest(description);
    })
    .catch((error)=>{
      Presenter.returnProductRequestError(error);
    })
    return LoadingTemplate();
  },

  relatedRequest (description) {
    let url = `http://cdn.100uu.tv/related/1640/?format=json`;
    fetch(url)
    .then((response) => {
      return response.json(); //返回一个带有文本的对象
    })
    .then((dic)=>{
      let array = dic.data;
      //请求成功后，将第一个借口的参数：description 和 当前接口的返回值传递给vimeo请求
      Presenter.vimeoRequest(description,array);
    })
    .catch((error)=>{
      Presenter.returnProductRequestError(error);
    })
  },

  vimeoRequest (description,relatedArray) {
    //嵌套一层请求
    var token = localStorage.getItem('product_vimeo_token');
    var vimeo_token = 'Bearer ' + token;
    var vimeoID = localStorage.getItem('product_vimeoID');
    var genre_id = localStorage.getItem('genre_id');
    var eps_url ;
    if (genre_id === '3') {
      eps_url = 'https://api.vimeo.com/videos/' + vimeoID;
    }else {
      eps_url = 'https://api.vimeo.com/me/albums/' + vimeoID + '/videos?direction=desc&page=1&per_page=100';
    };
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
      var doc = Presenter.makeDocument(product_successTemplate(genre_id,description,dic,relatedArray));
      doc.addEventListener("select",Presenter.loadFilm.bind(Presenter));
      var currentNavIndex = navigationDocument.documents.length - 1;
      var loadingTem = navigationDocument.documents[currentNavIndex];
      Presenter.changeCurrentTemplate(loadingTem,doc);
    })
    .catch((error)=>{
      Presenter.returnProductRequestError(error);
    })
  },

  //请求详情页面出错时的error模板
  returnProductRequestError (error) {
    let doc = Presenter.makeDocument(ErrorAlertTemplate(error));
    doc.addEventListener("select",Presenter.requestProductTemplate.bind(Presenter));
    var currentNavIndex = navigationDocument.documents.length - 1;
    var loadingTem = navigationDocument.documents[currentNavIndex];
    Presenter.changeCurrentTemplate(loadingTem,doc);
  },

  //获取更多页面数据
    requestMoreTemplate () {
      var categoryID = localStorage.getItem('categoryID');
      var categoryName = localStorage.getItem('categoryName');
      var url = 'http://cdn.100uu.tv/albums/?format=json&genre=' + categoryID + '&page=1&page_size=1000&platform=apple-tv';
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
