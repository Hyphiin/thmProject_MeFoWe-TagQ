<template>
  <div class="drawer">
    <button>Add Rect</button>
    <button>Add Text</button>
    <button>Safe Board</button>
    <button>Compare</button>    
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";


export default defineComponent({
  name: "Drawer",
  components: {},
  props: {
    
  },
  setup() {
    

    return {
      
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.canvas {
  height: 100%;
  margin: 20px;
  background-color: #21333c;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
