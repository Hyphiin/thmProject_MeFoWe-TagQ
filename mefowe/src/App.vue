<template>
  <div id="nav">
    <div class="nav__title">HTML/CSS QUIZ</div>
    <div class="nav__buttons">
      <router-link to="/">Home</router-link>
      <router-link to="/learn">Learn</router-link>
    </div>    
  </div>
  <router-view />
</template>

<style>
body{
  margin: 0px;
}
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #21333C;
  background-color: #4A5C66;
}

#nav {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #80BA24;
  font-weight: bold;
  color: #21333C;
}

#nav a {
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #4A5C66;
  color: white;
  text-decoration: none;
}
.nav__title{
  align-self: center;
}
.nav__buttons{
  width: 150px;
  display: flex;
  justify-content: space-between;
}

#nav a.router-link-exact-active {
   background-color: #21333C;
}
</style>
