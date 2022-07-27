<template>
  <div class="drawer" :class="drawerIsActive?'active':''">
    <div id="button" :class="drawerIsActive ? 'active' :''" v-on:click="drawerIsActive=!drawerIsActive">
    </div>
    <div id="container">
      <div id="cont">
        <div class="drawer_center">
          <button>Add Rect</button>
          <button>Add Text</button>
          <button>Add Button</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";


export default defineComponent({
  name: "Drawer",
  setup() {  
    let drawerIsActive = ref<boolean>(false)
    return {
      drawerIsActive,
    };
  }
});
</script>

<style scoped>










.drawer #button {
  width: 35px;
  height: 35px;
  border: #80ba24 12px solid;
  border-radius: 35px;
  margin: 0 auto;
  position: inherit;
  top: 30%;
  right: -25px;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  z-index: 9999;
}

.drawer #button.active {
  width: 35px;
  height: 35px;
  border: #80ba24 12px solid;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
}

.drawer {
  top: 110px;
  right: -32px;
  position: fixed;
  width: 2em;
  height: 50%;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 6px;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  z-index: 999;
}

.drawer.active {
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  width: 13em;
}

.drawer #container {
  margin-top: 5px;
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  background-color: #21333c;
  color: #21333c;
}

.drawer #cont {
  height: auto;
  margin: 0 auto;
  display: flex;
    flex-wrap: wrap;
}

.drawer_center {
  width: 500px;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
}

.drawer_center button{
  width: 100px;
  height: 100px;
  margin-left: 15px;
  margin-top: 15px;
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #80ba24;
  color: white;
  text-decoration: none;
  border: 0;
}

.drawer h3 {
  font-size: 30px;
  font-weight: 100;
  margin-top: 70px;
  margin-left: 40px;
}


</style>
