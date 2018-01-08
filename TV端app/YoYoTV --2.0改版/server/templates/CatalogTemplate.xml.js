var dataArr = {
  "data" : [
    {
       "icon" : "icon1",
       "title" : "个人信息"
    },
    {
      "icon" : "icon2",
      "title" : "个人健康档案"
    },
  ]
}

//返回多少个cell
var cells = function (arr) {
  let catelog_cellTemplate = [];
  arr.map((cellData, index) => {
    catelog_cellTemplate.push(`
        <lockup videoURL="https://fpdl.vimeocdn.com/vimeo-prod-skyfire-std-us/01/525/8/202629920/686784648.mp4?token=58b3df96_0x46dc66037379fe6481e9a904fafc84962baf5e61">
          <img src="${this.BASEURL}images/ray.png" width="500" height="308" />
          <title>${cellData.title}</title>
          <description>description:${cellData.title}</description>
        </lockup>
      `)
  });
  return catelog_cellTemplate.join('');
}

var CatalogTemplate = function() { return `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
    <catalogTemplate>
      <banner>
        <title>RWDevConHighlights</title>
      </banner>
      <list>
        <section>
          <listItemLockup>
            <title>Inspiration Videos</title>
            <decorationLabel>13</decorationLabel>
            //1. add from here
            <relatedContent>
              <grid>
                <section>
                  ${cells(dataArr.data)}
                </section>
              </grid>
            </relatedContent>
          </listItemLockup>
        </section>
      </list>
    </catalogTemplate>
  </document>`
}
