<template>
  <div class="home">
    <div class="home__code">
      <CodeComponent :chosen-layout="chosenLevel" @created-image="saveImage" />
    </div>
    <div class="home__canvas">
      <CanvasComponent
        :created-image="createdImage"
        @next-question="chooseNewLevel"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import CodeComponent from "@/components/CodeComponent.vue"; // @ is an alias to /src
import CanvasComponent from "@/components/CanvasComponent.vue"; // @ is an alias to /src
import store from "@/store";

export default defineComponent({
  name: "Test",
  components: {
    CodeComponent,
    CanvasComponent,
  },
  setup() {
    const chosenLevel = ref<string>(store.state.chosenOption);

    watch(
      () => store.state.chosenOption,
      (newValue) => {
        chosenLevel.value = newValue;
      }
    );

    const createdImage = ref<string>("");

    const saveImage = (image: string) => {
      createdImage.value = image;
    };

    function getRandomInt(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const chooseNewLevel = () => {
      if (store.state.level1.includes(chosenLevel.value)) {
        console.log("level1")
        store.commit("chooseLevel", store.state.level1[getRandomInt(0, 4)]);
      } else if (store.state.level2.includes(chosenLevel.value)) {
        store.commit("chooseLevel", store.state.level2[getRandomInt(0, 4)]);
      }
    };

    return {
      chosenLevel,
      createdImage,
      saveImage,
      chooseNewLevel,
    };
  },
});
</script>

<style scoped>
.home {
  display: flex;
  padding: 22.5px 50px;
}
.home__code {
  min-width: 30%;
}
.home__canvas {
  min-width: 70%;
}
</style>
