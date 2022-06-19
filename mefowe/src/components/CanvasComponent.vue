<template>
  <div class="canvas">
    <button @click="addRect">Add Rect</button>
    <v-stage
      ref="stage"
      :config="configKonva"
      @dragstart="handleDragstart"
      @dragend="handleDragend"
    >
      <v-layer ref="layer">
        <v-rect
          v-for="item in list"
          :key="item.id"
          :config="{
            x: 100,
            y: 100,
            rotation: 85,
            id: '1',
            fill: 'red',
            shadowBlur: 10,
            width: 100,
            height: 100,
            draggable: true,
          }"
        />
      </v-layer>
    </v-stage>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Rect } from "konva/lib/shapes/Rect";

export default defineComponent({
  name: "Canvas",
  components: {
  },
  props: {
    msg: String,
  },
  setup() {   
    const width = 715;
    const height = window.innerHeight;

    const list = ref<Rect[]>([]);
    const dragItemId = ref<string>();

    const configKonva = ref({
      width: width,
      height: height,
    });

    const handleDragstart = (e: DragEvent) => {
      if (e.target != null && e.target instanceof HTMLElement) {
        // save drag element:
        dragItemId.value = e.target.id;
        // move current element to the top:
        const item = list.value.find((i) => i.id() === dragItemId.value);
        const index = list.value.indexOf(item as Rect);
        list.value.splice(index, 1);
        list.value.push(item as Rect);
      }
    };
    const handleDragend = () => {
      dragItemId.value = "";
    };

    const addRect = () => {
      list.value.push(
        new Rect({
          id: Math.round(Math.random() * 10000).toString(),
          x: 100,
          y: 100,
          rotation: 75,
          draggable: true,
        })
      );
    };

    return {
      list,
      dragItemId,
      configKonva,
      handleDragstart,
      handleDragend,
      addRect,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.canvas{
  height: 100%;
  margin: 20px;
  background-color: #21333C;
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
