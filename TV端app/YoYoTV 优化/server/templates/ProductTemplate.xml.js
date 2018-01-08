
var product_requestSuccessTemplate = function (genre_id,description,bigDic) {
  var director = localStorage.getItem('product_director');
  var name = localStorage.getItem('product_name');
  var cast1 = localStorage.getItem('product_cast1');
  var cast2 = localStorage.getItem('product_cast2');
  var cast3 = localStorage.getItem('product_cast3');
  var cast4 = localStorage.getItem('product_cast4');
  var release_date = localStorage.getItem('product_release_date');
  var launchImg = localStorage.getItem('product_launchImg');
  var castsArray = [cast1,cast2,cast3,cast4];
  return `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
   <productTemplate theme="dark">
      <background>
      </background>
      <banner>
        <infoList>
            <info>
               <header>
                  <title>Director</title>
               </header>
               <text>${director}</text>
            </info>
            <info>
               <header>
                  <title>Actors</title>
               </header>
               ${castTemplate(castsArray)}
            </info>
         </infoList>
         <stack>
            <title>${name}</title>
            <row>
               <text><badge src="resource://tomato-fresh"/> 99%</text>
               <text>${release_date}</text>
               <badge src="resource://mpaa-pg" class="badge" />
               <badge src="resource://cc" class="badge" />
            </row>
            <text></text>
            <description allowsZooming="true" moreLabel="more" id="product_description_btn">${description}</description>
            <row>
               <buttonLockup id="product_playBtn" >
                  <badge src="resource://button-preview" />
                  <title>Preview</title>
               </buttonLockup>
            </row>
         </stack>
         <heroImg src="${launchImg}" />
      </banner>
      ${isVideoOrAlbum(genre_id,bigDic)}
   </productTemplate>
</document>`
}

var isVideoOrAlbum = function (genre_id,bigDic) {
  if (genre_id === '3') {
    getDefaultUrl(bigDic);
  }else {
    return `
      <shelf>
         <header>
            <title>${bigDic.data.length} Episodes</title>
         </header>
         <section>
           ${episodesTemplate(bigDic.data)}
         </section>
      </shelf>
    `
  }
}

var castTemplate = function (castsArray) {
  var castTemplateArray = [];
  castsArray.map((cast,index)=>{
    if (cast !== undefined) {
      castTemplateArray.push(`
        <text>${cast}</text>
      `);
    }
  });
  return castTemplateArray.join('');
}

var episodesTemplate = function (playListURLArray) {
  var episodesTemplateArray = [];
  var episodesBackgroundImg = BASEURL + '/images/product_episodes_bg.png';
  var playUrlArray = [];
  playListURLArray.map((productCellData,index)=>{
    var playUrl = compareSize(productCellData.files,productCellData.download);
    playUrlArray.push(playUrl);

    var episodeNum = index + 1;
    episodesTemplateArray.push(`
      <lockup playUrlIndex='${index}'>
        <img src="${episodesBackgroundImg}" width="100" height="100" />
        <overlay>
         <title style="color:rgba(255,255,255,1.0);tv-align: center;tv-text-style: subtitle1;">${episodeNum}</title>
        </overlay>
      </lockup>
    `)
  });
  let str = JSON.stringify(playUrlArray);
  localStorage.setItem('playUrlArray',str);
  return episodesTemplateArray.join('');
}

var getDefaultUrl = function (bigDic) {
debugger
  var videoFileArray = [];
  var playUrl = compareSize(bigDic.files,bigDic.download);
  videoFileArray.push(playUrl);
  let str = JSON.stringify(videoFileArray);
  localStorage.setItem('playUrlArray',str);
}

var compareSize = function (files,download) {
  var playURLListArray = [];
  files.map((file,index)=>{
    if (file.width) {
      playURLListArray.push(file);
    }
  });
  download.map((file,index)=>{
    if (file.width) {
      playURLListArray.push(file);
    }
  });
  playURLListArray.sort(function (a,b) {
    return b.size - a.size;
  });
  return playURLListArray[0].link;
}
