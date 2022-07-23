<template>
  <div class="canvas">
    <button @click="addRect">Add Rect</button>
    <button @click="safeBoard">Safe Board</button>
    <button @click="compare">Compare</button>
    <v-stage ref="stage" :config="configKonva" @dragstart="handleDragstart" @dragend="handleDragend"
      @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
      <v-layer ref="layer-grid">
        <v-line v-for="[idx, item] in Object.entries(gridLines)" :key="idx" :config="{
          id: item.id(),
          x: item.x(),
          y: item.y(),
          points: item.points(),
          stroke: item.stroke(),
          strokeWidth: item.strokeWidth(),
        }" />
        <v-transformer ref="transformer" />
      </v-layer>
       <v-layer ref="layer">
        <v-rect v-for="[idx, item] in Object.entries(list)" :key="idx" :config="{
          id: item.id(),
          x: item.x(),
          y: item.y(),
          fill: item.fill(),
          width: item.width(),
          height: item.height(),
          draggable: true,
        }" @transformend="handleTransformEnd" />
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Util } from "konva/lib/Util";
import { KonvaEventListener, KonvaEventObject } from "konva/lib/Node";
import { KonvaNodeEvent } from "konva/lib/types";
import { Stage, StageConfig } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import { Line } from "konva/lib/shapes/Line"
import resemble from "resemblejs";

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
    const gridLines = ref<Line[]>([]);
    const dragItemId = ref<string>();

    const selectedShapeId = ref<string>();

    const transformer = ref<any>();

    const configKonva = ref({
      width: width,
      height: height,
    });
    onMounted(() => {
      drawLinesSolution()
    })

    let userImage = '';

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

    const safeBoard = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      stage.toDataURL({
        pixelRatio: 2,
        callback(img) {
          userImage = img;
        }
      });
    }

    const compare = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      let compareImage = '';
      stage.toDataURL({
        pixelRatio: 2,
        callback(img) {
          compareImage = img;
        }
      });
      var diff = resemble(userImage).compareTo(compareImage).ignoreColors()
        .onComplete(function (data) {
          console.log(data);
        });
    }

    const stepSize = 40;
    const drawLinesSolution = () => {


      const
        // find the x & y size of the grid
        xSize = window.innerWidth * 0.66,
        ySize = window.innerHeight * 0.85,

        // compute the number of steps required on each axis.
        xSteps = Math.round(xSize / stepSize),
        ySteps = Math.round(ySize / stepSize);


      // draw vertical lines
      for (let i = 0; i <= xSteps; i++) {
        gridLines.value.push(
          new Line({
            id: Math.round(Math.random() * 10000).toString(),
            x: 0 + i * stepSize,
            y: ySize,
            points: [0, 0, 0, ySize],
            stroke: 'rgba(0, 0, 0, 0.2)',
            strokeWidth: 1,
          })
        );
      }
      //draw Horizontal lines
      for (let i = 0; i <= ySteps; i++) {
        gridLines.value.push(
          new Line({
            id: Math.round(Math.random() * 10000).toString(),
            x: xSize,
            y: 0 + i * stepSize,
            points: [0, 0, xSize, 0],
            stroke: 'rgba(0, 0, 0, 0.2)',
            strokeWidth: 1,
          })
        );
      }
      console.log(gridLines)
    }


    const addRect = () => {
      drawLinesSolution()
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
      userImage,
      gridLines,
      handleDragstart,
      handleDragend,
      safeBoard,
      compare,
      addRect,
      handleTransformEnd,
      handleStageMouseDown,
      updateTransformer,
      drawLinesSolution,
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