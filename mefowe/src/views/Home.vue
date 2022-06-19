<template>
  <div class="home">
    <div class="home__code">
      <CodeComponent />
    </div>
    <div class="home__canvas">
      <CanvasComponent />
    </div>    
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CodeComponent from "@/components/CodeComponent.vue";// @ is an alias to /src
import CanvasComponent from "@/components/CanvasComponent.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {
    CodeComponent,
    CanvasComponent
  },
});
</script>


<style scoped>
.home{
  display: flex;
  padding: 30px 50px;
}
.home__code{
  min-width: 30%; 
}
.home__canvas{
  min-width: 70%; 
}
</style>
