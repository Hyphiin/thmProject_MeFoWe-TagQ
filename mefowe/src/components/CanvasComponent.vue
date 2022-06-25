<template>
  <div class="canvas">
    <button @click="addRect">Add Rect</button>
    <v-stage
      ref="stage"
      :config="configKonva"
      @dragstart="handleDragstart"
      @dragend="handleDragend"
      @mousedown="handleStageMouseDown"
      @touchstart="handleStageMouseDown"
    >
      <v-layer ref="layer">
        <v-rect
          v-for="[idx, item] in Object.entries(list)"
          :key="idx"
          :config="{
            id: item.id(),
            x: item.x(),
            y: item.y(),
            fill: item.fill(),
            width: item.width(),
            height: item.height(),
            draggable: true,
          }"
          @transformend="handleTransformEnd"
        />
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Util } from "konva/lib/Util";
import { KonvaEventListener, KonvaEventObject } from "konva/lib/Node";
import { KonvaNodeEvent } from "konva/lib/types";
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";

export default defineComponent({
  name: "Canvas",
  components: {},
  props: {
    msg: String,
  },
  setup() {
    const width = window.innerWidth * 0.66;
    const height = window.innerHeight * 0.85;

    const list = ref<Rect[]>([]);
    const dragItemId = ref<string>();

    const selectedShapeId = ref<string>();

    const transformer = ref<any>();

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
          x: Math.round(Math.random() * width),
          y: Math.round(Math.random() * height),
          fill: Util.getRandomColor(),
          width: 100,
          height: 100,
          draggable: true,
        })
      );
    };

    const handleTransformEnd = (e: KonvaEventObject<KonvaNodeEvent>) => {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const shape = list.value.find(
        (r) => r.id() === selectedShapeId.value
      )!.attrs;

      if (shape && !(shape instanceof Layer)) {
        // update the state
        shape.x = e.target.x();
        shape.y = e.target.y();
        shape.rotation = e.target.rotation();
        shape.scaleX = e.target.scaleX();
        shape.scaleY = e.target.scaleY();

        // // change fill
        // shape.fill = Util.getRandomColor();
      }
    };

    const handleStageMouseDown = (e: KonvaEventObject<KonvaNodeEvent>) => {
      // filter native events
      if (!e.evt) {
        return;
      }
      // clicked on stage - clear selection
      if (e.target === e.target.getStage()) {
        selectedShapeId.value = "";
        updateTransformer();
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer =
        e.target.getParent().className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }

      // find clicked shape by its name
      const id = e.target.id();
      const shape = list.value.find((r) => r.id() === id);

      if (shape && !(shape instanceof Layer)) {
        selectedShapeId.value = id;
      } else {
        selectedShapeId.value = "";
      }
      updateTransformer();
    };

    const updateTransformer = () => {
      // here we need to manually attach or detach Transformer node
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      const selectedNode = stage.findOne("#" + selectedShapeId.value);

      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode && !(selectedNode instanceof Layer)) {
        // attach to another node
        transformerNode.nodes([selectedNode]);
      } else {
        // remove transformer
        transformerNode.nodes([]);
      }
    };

    return {
      list,
      dragItemId,
      transformer,
      configKonva,
      handleDragstart,
      handleDragend,
      addRect,
      handleTransformEnd,
      handleStageMouseDown,
      updateTransformer,
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
