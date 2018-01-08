var HomeTemplate = function () {
  return Presenter.requestHomeTemplate();
}

var home_requestSuccess = function (bigJson) {
  return `<document>
    <stackTemplate>
        <collectionList>
          <carousel>
           <section>
            ${HomeTemplate_View.topScroll(bigJson)}
           </section>
          </carousel>
            ${HomeTemplate_View.shelfs(bigJson)}
        </collectionList>
     </stackTemplate>
  </document>`
}

var HomeTemplate_View = {
  topScroll : function (json) {
    var scrollArray = json.data[0].carousel_episodes;
    var array = [];
    scrollArray.map((cellData,index)=>{
      if (cellData.apple_poster.indexOf("default") == -1) {
        array.push(`
          <lockup vimeoID="${cellData.vimeo_id}" albumID="${cellData.id}" vimeo_token="${cellData.vimeo_token}" name="${cellData.name}" director="${cellData.director}" cast1="${cellData.cast1}" cast2="${cellData.cast2}" cast3="${cellData.cast3}" cast4="${cellData.cast4}" release_date="${cellData.release_date}" launchImg="${cellData.portrait_poster_b}" genre_id="${cellData.genre_id}">
            <img src="${cellData.apple_poster}" width="1740" height="500" />
            <overlay class="carouselOverlay">
              <title>${cellData.name}</title>
              <subtitle>${cellData.description}</subtitle>
            </overlay>
          </lockup>
        `);
      }
    });
    return array.join('');
  },

  shelfs : function (bigJson) {
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
      if (categoryDataArray.en_name != "Recommend") {
        genreListItemsArray.push(`
          <shelf>
            <header>
              <title>${categoryDataArray.name}</title>
            </header>
            <section>
              ${HomeTemplate_View.sections(categoryDataArray.carousel_episodes, categoryDataArray.id, categoryDataArray.name)}
            </section>
          </shelf>
        `);
      }
    });
    return genreListItemsArray.join('');
  },

  sections : function (categoryDataArray,categoryID,categoryName) {
    var sectionsItemArray = [];
    categoryDataArray.map((cellItem,index)=>{
      sectionsItemArray.push(`
         ${HomeTemplate_View.items(cellItem)}
      `)
    });
    //判断个数是否多余，多则添加 MORE 选项
    if (categoryDataArray.length >= 0) {
      var itemdoc = HomeTemplate_View.more(categoryID,categoryName);
      sectionsItemArray.push(itemdoc);
    }
    return sectionsItemArray.join('');
  },

  items : function (cellItemDic) {
    return `
      <lockup vimeoID="${cellItemDic.vimeo_id}" albumID="${cellItemDic.id}" vimeo_token="${cellItemDic.vimeo_token}" name="${cellItemDic.name}" director="${cellItemDic.director}" cast1="${cellItemDic.cast1}" cast2="${cellItemDic.cast2}" cast3="${cellItemDic.cast3}" cast4="${cellItemDic.cast4}" release_date="${cellItemDic.release_date}" launchImg="${cellItemDic.portrait_poster_b}" genre_id="${cellItemDic.genre_id}">
         <img src="${cellItemDic.portrait_poster_m}" width="255" height="363" style="tv-placeholder: movie"/>
         <title>${cellItemDic.name}</title>
      </lockup>
    `
  },

  more : function (categoryID,categoryName) {
    var moreImg = BASEURL + '/images/More.png';
    return `
      <lockup isHaveMore="more" categoryID="${categoryID}" categoryName="${categoryName}">
         <img src="${moreImg}" width="255" height="363" style="tv-placeholder: http://localhost:9001/images/home_up_0.png"/>
         <title>More</title>
      </lockup>
    `
  },
}
