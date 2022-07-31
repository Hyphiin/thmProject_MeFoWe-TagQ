<template>
  <div id="nav">
    <div class="nav__title">HTML/CSS QUIZ</div>
    <div class="nav__buttons">
      <router-link to="/">StartPage</router-link>
      <router-link to="/learn">Learn</router-link>
    </div>
  </div>
  <router-view />
  <div class="footer">
    <div id="button"></div>
    <div id="container">
      <div id="cont">
        <div class="footer_center">
          <h3>Medienfokussierte Webanwendungen</h3>
          <h4>Sommersemester 2022</h4>
          <h5>Chiara Knipprath | Felix Wegener | Nils Friedrich</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0px;
}
#app {
  font-family: consolas;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #21333c;
  background-color: #4a5c66;
}

#nav {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #80ba24;
  font-weight: bold;
  color: #21333c;
}

#nav a {
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #4a5c66;
  color: white;
  text-decoration: none;
}
.nav__title {
  align-self: center;
}
.nav__buttons {
  display: flex;
  justify-content: space-between;
}

#nav a.router-link-exact-active {
  background-color: #21333c;
}

.footer #button {
  width: 35px;
  height: 35px;
  border: #21333c 12px solid;
  border-radius: 35px;
  margin: 0 auto;
  position: relative;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
}
.footer #button:hover {
  width: 35px;
  height: 35px;
  border: #21333c 12px solid;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  position: relative;
}
.footer {
  bottom: 0;
  left: 0;
  position: fixed;
  width: 100%;
  height: 2em;
  overflow: hidden;
  margin: 0 auto;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  z-index: 999;
}
.footer:hover {
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  height: 20em;
}
.footer #container {
  margin-top: 5px;
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  background-color: #80ba24;
  color: #21333c;
}
.footer #cont {
  position: relative;
  top: -45px;
  right: 190px;
  width: 150px;
  height: auto;
  margin: 0 auto;
}
.footer_center {
  width: 500px;
  float: left;
  text-align: center;
}
.footer h3 {
  font-size: 30px;
  font-weight: 100;
  margin-top: 70px;
  margin-left: 40px;
}
</style>
