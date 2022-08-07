<template>
  <div class="startpage">
    <h1>Willkommen!</h1>
    <h2>Wähle eine Option.</h2>
    <Card @chosen-option="receiveOption" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import Card from "@/components/CardComponent.vue";
import store from "@/store";

export default defineComponent({
  name: "Home",
  components: { Card },
  setup() {
    function getRandomInt(min: number, max: number) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const chosenOption = ref<string>("level1");

    const receiveOption = (option: string) => {
      switch (option) {
        case "level1": {
          chosenOption.value = store.state.level1[getRandomInt(0, 4)];
          break;
        }
        case "level2": {
          chosenOption.value = store.state.level2[getRandomInt(0, 4)];
          break;
        }
        case "level3": {
          chosenOption.value = store.state.level3[getRandomInt(0, 4)];
          break;
        }
        default: {
          break;
        }
      }
    };

    watch(
      () => chosenOption.value,
      (newValue) => {
        store.commit("chooseLevel", newValue);
      }
    );

    return {
      chosenOption,
      receiveOption,
    };
  },
});
</script>

<style scoped>

.startpage {
  color: white;
  margin: 0;
  padding: 0;
  /* background: #333; */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: consolas;

  height: 100vh;
}
h1 {
  font-family: "Roboto_Light";
}
h2 {
  margin-bottom: 50px;
  font-family: "Roboto_Light";
}
</style>
