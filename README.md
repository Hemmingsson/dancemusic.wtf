<br>
<br>
<p align="center">
  <a href="http://dancemusic.wtf/">
    <img width="700" align="center" src="assets/images/logo.png?raw=true">
  </a>
</p>
<h4 align="center">Quiz game for learning electronic dance music styles. How high can you score?
</h4>


<br>

<br>

<hr>
<br>

[DANCEMUSIC WTF-300](http://dancemusic.wtf/) is a web based quiz game created for us to learn what the different electronic dance music styles sound like. Hopefully it will help us get a better vocabulary next time we're trying to describe that great track we heard the other night.<br>


#### 🗄️Dataset

Dancemusic.wtf uses 592 music tracks from 57 different subgenres in Electronic Dance Music. <br>The dataset is based upon [musicmap.info](https://www.musicmap.info/) and its public [YouTube playlists](https://www.youtube.com/channel/UCvwUL1or_EKtt-qmt_ob2KA/playlists). Created by Kwinten Crauwels. 

> Musicmap attempts to provide the ultimate genealogy of popular music genres, including their relations and history. It is the result of more than **seven years of research** with over 200 listed sources and cross examination of many other visual genealogies. Its aim is to focus on the delicate balance between comprehensibility, accuracy and accessibility.


(I recommend you to visit musicmap.info if you want to dig deeper, or learn about other genres outside of the electronic dance music cluster. It is a gold mine!)


#### Browser support

Use a current browser that supports JavaScript modules. Local production builds pass a headless Chrome startup check. YouTube must permit embedding and playback for each track; availability can change.


<br>

<br>



  <a href="http://dancemusic.wtf/">
    <img align="center" src="assets/images/screenshot.jpg?raw=true">
  </a>


<br>

<br>

<br>


## Development

Use Node.js 22 or later. Run `npm ci`, then `npm start` for development or `npm run build` to create `dist/`. Parcel is installed locally.

Run `npm test` to check player polling. A blocked or unavailable YouTube video now ends loading with an error; select Start to retry. Completed games list the tracks that were played.
