var HomeTemplate = function () {
  return `<document>
     <stackTemplate>
        <banner>
           <title>YoYo Movies</title>
        </banner>
        <collectionList>
           <shelf>
              <section>
                 ${catelog_cells_up()}
              </section>
           </shelf>
           <shelf>
              <section>
                 ${catelog_cells_down()}
              </section>
           </shelf>
        </collectionList>
     </stackTemplate>
  </document>`
}

var catelog_cells_up = function () {
  let home_cellTemplate = [];
  for (var i = 0; i < 7; i++) {
    let imgStr = "http://localhost:9001/images/home_up_" + i + ".png";
    if (i == 0) {
      home_cellTemplate.push(`
          <lockup tagValue="homepage_up_scrollview">
             <img src="${imgStr}" width="801" height="450" />
             <title>Movie ${i}</title>
          </lockup>
        `)
    }else {
      home_cellTemplate.push(`
          <lockup tagValue="homepage_up_${i}">
             <img src="${imgStr}" width="315" height="450" />
             <title>Movie ${i}</title>
          </lockup>
        `)
    }
  }
  return home_cellTemplate.join('');
}

var catelog_cells_down = function () {
  let cellTemplate = [];
  for (var i = 0; i < 7; i++) {
    let imgStr = "http://localhost:9001/images/home_down_" + i + ".png";
    if (i==0) {
      cellTemplate.push(`
          <lockup tagValue="homepage_down_playhistory" onselect="
              var doc = Presenter.makeDocument(LoadingTemplate());
              Presenter.pushDocument(doc);
            ">
             <img src="${imgStr}" width="270" height="276" />
             <title>Movie ${i}</title>
          </lockup>
        `)
    }else {
      cellTemplate.push(`
          <lockup tagValue="homepage_down_${i}">
             <img src="${imgStr}" width="492" height="276" />
             <title>Movie ${i}</title>
          </lockup>
        `)
    }
  }
  return cellTemplate.join('');
}
