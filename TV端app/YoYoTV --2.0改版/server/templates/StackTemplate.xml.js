var StackTemplate = function (array) {
  return Presenter.requestHomeTemplate();
}

var requestSuccess = function (bigJson) {
  return `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
    <stackTemplate>
        <collectionList>
          <carousel>
           <section>
            ${topScroll(bigJson)}
           </section>
          </carousel>
            ${shelfs(bigJson)}
        </collectionList>
     </stackTemplate>
  </document>`
}

//顶部的滚动视图
var topScroll = function (json) {
  // var jsstr = localStorage.getItem('homePage_bigStr')
  // var json = JSON.parse(jsstr);
  var scrollArray = json.carousel;
  var array = [];
  scrollArray.map((cellData,index)=>{
    if (cellData.isActivity) {
      array.push(`
          <lockup vimeoID="${cellData.vimeo_id}" albumID="${cellData.id}" vimeo_token="${cellData.vimeo_token}" name="${cellData.name}" director="${cellData.director}" cast1="${cellData.cast1}" cast2="${cellData.cast2}" cast3="${cellData.cast3}" cast4="${cellData.cast4}" release_date="${cellData.release_date}" launchImg="${cellData.portrait_poster_b}" genre_id="${cellData.genre_id}" isPay="${cellData.pay}" isActivity="${cellData.isActivity}" activity_name="${cellData.activity_name}" image_activity="${cellData.image_activity}">
            <img src="${cellData.image_activity}" width="1740" height="500" />
            <overlay class="carouselOverlay">
              <text style="tv-position: bottom-left; font-size:40; tv-highlight-color:rgb(255,255,255); font-weight:default;">${cellData.activity_name}</text>
              ${isVipOnScroll(cellData)}
            </overlay>
          </lockup>
      `)
    } else if (cellData.apple_poster.indexOf("default") == -1) {
      array.push(`
        <lockup vimeoID="${cellData.vimeo_id}" albumID="${cellData.id}" vimeo_token="${cellData.vimeo_token}" name="${cellData.name}" director="${cellData.director}" cast1="${cellData.cast1}" cast2="${cellData.cast2}" cast3="${cellData.cast3}" cast4="${cellData.cast4}" release_date="${cellData.release_date}" launchImg="${cellData.portrait_poster_b}" genre_id="${cellData.genre_id}" isPay="${cellData.pay}" isActivity="${cellData.isActivity}" activity_name="${cellData.activity_name}" image_activity="${cellData.image_activity}">
          <img src="${cellData.apple_poster}" width="1740" height="500" />
          <overlay class="carouselOverlay">
            <text style="tv-position: bottom-left; font-size:40; tv-highlight-color:rgb(255,255,255); font-weight:default;">${cellData.name}</text>
            ${isVipOnScroll(cellData)}
          </overlay>
        </lockup>
      `);
    }
    //<subtitle>${cellData.description}</subtitle>
  });
  return array.join('');
}

var isVipOnScroll = function (cellData) {
  if (cellData.pay) {
    return `
      <text style="background-color: rgba(255,0,30); text-align:center; font-size:40; tv-position: bottom; tv-highlight-color:rgb(255,255,255); tv-align: left; width:80; margin:0 0 0 20">VIP</text>
    `
  }
}

var shelfs = function (bigJson) {
  var genreListItemsArray = [];

  // for (key in bigJson.data) {
  //   if (key != 'recommend') {
  //     genreListItemsArray.push(`
  //       <shelf>
  //         <header>
  //           <title>${bigJson.data[key].name}</title>
  //         </header>
  //         <section>
  //           ${sections(bigJson.data[key].carousel_episodes)}
  //         </section>
  //       </shelf>
  //     `);
  //   }
  // }

  bigJson.data.map((categoryDataArray,index)=>{
    if (categoryDataArray.data != undefined) {
      genreListItemsArray.push(`
        <shelf>
          <header>
            <title>${categoryDataArray.name}</title>
          </header>
          <section>
            ${sections(categoryDataArray.data, categoryDataArray.genre_id, categoryDataArray.name)}
          </section>
        </shelf>
      `);
    }
  });
  return genreListItemsArray.join('');
}

var sections = function (categoryDataArray,categoryID,categoryName) {
  var sectionsItemArray = [];
  categoryDataArray.map((cellItem,index)=>{
    if (cellItem.portrait_poster_m.indexOf("default") == -1) {
      sectionsItemArray.push(`
         ${items(cellItem)}
      `)
    }
  });
  //判断个数是否多余，多则添加 MORE 选项
  // if (categoryDataArray.length >= 10) {
    var itemdoc = more(categoryID,categoryName);
    sectionsItemArray.push(itemdoc);
  // }
  return sectionsItemArray.join('');
}

var items = function (cellItemDic) {
  if (cellItemDic.isActivity) {
    return `
      <lockup vimeoID="${cellItemDic.vimeo_id}" albumID="${cellItemDic.id}" vimeo_token="${cellItemDic.vimeo_token}" name="${cellItemDic.name}" director="${cellItemDic.director}" cast1="${cellItemDic.cast1}" cast2="${cellItemDic.cast2}" cast3="${cellItemDic.cast3}" cast4="${cellItemDic.cast4}" release_date="${cellItemDic.release_date}" launchImg="${cellItemDic.portrait_poster_b}" genre_id="${cellItemDic.genre_id}" isPay="${cellItemDic.pay}" isActivity="${cellItemDic.isActivity}" activity_name="${cellItemDic.activity_name}" image_activity="${cellItemDic.image_activity}">
         <img src="${cellItemDic.image_activity}" width="255" height="363" style="tv-placeholder: movie"/>
         <title>${cellItemDic.activity_name}</title>
         ${obliqueVipLogo(cellItemDic)}
      </lockup>
    `
  } else {
    return `
      <lockup vimeoID="${cellItemDic.vimeo_id}" albumID="${cellItemDic.id}" vimeo_token="${cellItemDic.vimeo_token}" name="${cellItemDic.name}" director="${cellItemDic.director}" cast1="${cellItemDic.cast1}" cast2="${cellItemDic.cast2}" cast3="${cellItemDic.cast3}" cast4="${cellItemDic.cast4}" release_date="${cellItemDic.release_date}" launchImg="${cellItemDic.portrait_poster_b}" genre_id="${cellItemDic.genre_id}" isPay="${cellItemDic.pay}" isActivity="${cellItemDic.isActivity}" activity_name="${cellItemDic.activity_name}" image_activity="${cellItemDic.image_activity}">
         <img src="${cellItemDic.portrait_poster_m}" width="255" height="363" style="tv-placeholder: movie"/>
         <title>${cellItemDic.name}</title>
         ${obliqueVipLogo(cellItemDic)}
      </lockup>
    `
  }
}

var obliqueVipLogo = function (cellItemDic) {
  if (cellItemDic.pay) {
    var imageName = BASEURL + '/images/VIP.png';
    return `
      <overlay style="padding: 0">
        <img style="tv-align:left; tv-position: top-left;" width="73" height="73" src="${imageName}"/>
      </overlay>
    `
  }
}

var more = function (categoryID,categoryName) {
  var moreImg = BASEURL + '/images/More.png';
  console.log('moreImg:' + moreImg);
  return `
    <lockup isHaveMore="more" categoryID="${categoryID}" categoryName="${categoryName}">
       <img src="${moreImg}" width="255" height="363" style="tv-placeholder: http://localhost:9001/images/home_up_0.png"/>
       <title>More</title>
    </lockup>
  `
}
