var SearchTemplate = function () {
  var doc = `<?xml version="1.0" encoding="UTF-8" ?>
  <document>
   <searchTemplate>
      <searchField id="searchField"/>
      <shelf>
         <header>
            <title>Popular</title>
         </header>
         <section>
            <lockup>
               <img src="http://localhost:9001/images/0.jpg" width="182" height="274" />
               <title>Movie 1</title>
            </lockup>
            <lockup>
               <img src="${this.BASEURL}images/1.png" width="182" height="274" />
               <title>Movie 2</title>
            </lockup>
            <lockup>
               <img src="path to images on your server/Car_Movie_250x375_C.png" width="182" height="274" />
               <title>Movie 3</title>
            </lockup>
         </section>
      </shelf>
   </searchTemplate>
 </document>`

return doc;
}
