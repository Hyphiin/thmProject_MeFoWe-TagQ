<template>
  <div class="canvas">
    <button @click="addRect">Add Rect</button>
    <button @click="addText">Add Text</button>
    <button @click="addButton">Add Button</button>
    <button @click="safeBoard">Safe Board</button>
    <button @click="compare">Compare</button>
    <v-stage ref="stage" :config="configKonva" @dragstart="handleDragstart" @dragend="handleDragend"
      @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
      <v-layer ref="layer">
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
    <div class="navigation">
      <ul>
        <li>
          <a href="#">
            <span class="icon">
              <i class="fa fa-sign-out" aria-hidden="true"></i>
            </span>
            <span class="title">Hello</span>
          </a>
        </li>
        <li><a href="#">
            <span class="icon">
              <font-awesome-icon icon="fa-solid fa-circle-dot" />
            </span>
            <span class="title">Hello</span>
          </a></li>
        <li><a href="#">
            <span class="icon">
              <font-awesome-icon icon="fa-solid fa-circle-dot" />
            </span>
            <span class="title">Hello</span>
          </a></li>
        <li><a href="#">
            <span class="icon">
              <font-awesome-icon icon="fa-solid fa-circle-dot" />
            </span>
            <span class="title">Hello</span>
          </a></li>
        <li><a href="#">
            <span class="icon">
              <font-awesome-icon icon="fa-solid fa-circle-dot" />
            </span>
            <span class="title">Hello</span>
          </a></li>
      </ul>
    </div>
    <div class="toggle"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Util } from "konva/lib/Util";
import { KonvaEventObject } from "konva/lib/Node";
import { KonvaNodeEvent } from "konva/lib/types";
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import resemble from "resemblejs";
//import DrawerComponent from "@/components/DrawerComponent.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Canvas",
  components: {},
  props: {
    msg: String,
  },
  setup() {
    const width = window.innerWidth * 0.66;
    const height = window.innerHeight * 0.85;

    const rectList = ref<Rect[]>([]);
    const textList = ref<Text[]>([]);
    const buttonList = ref<Group[]>([]);
    const dragItemId = ref<string>();

    const selectedShapeId = ref<string>();

    const transformer = ref<any>();

    const configKonva = ref({
      width: width,
      height: height,
    });

    let userImage = '';

    const handleDragstart = (e: DragEvent) => {
      if (e.target != null && e.target instanceof HTMLElement) {
        // save drag element:
        dragItemId.value = e.target.id;
        // move current element to the top:
        console.log(e.target)
        const item = rectList.value.find((i) => i.id() === dragItemId.value);
        const index = rectList.value.indexOf(item as Rect);
        rectList.value.splice(index, 1);
        rectList.value.push(item as Rect);
      }
    };
    const handleDragend = () => {
      dragItemId.value = "";
    };

    const safeBoard = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      stage.toDataURL({pixelRatio: 2,
      callback(img) {
        userImage = img;
       }});
    }

    const compare = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      let compareImage= '';
      stage.toDataURL({pixelRatio: 2,
      callback(img) {
        compareImage = img;
       }});
       var diff = resemble(userImage).compareTo(compareImage).ignoreColors()
      .onComplete(function (data) {
        console.log(data);
    });
    }

    var rectLayer = new Layer();
    const addRect = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;

      var newRect = new Rect({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        stroke: Util.getRandomColor(),
        strokeWidth: 2,
        width: 100,
        height: 100,
        draggable: true,
      })
      rectList.value.push(newRect);
      rectLayer.add(newRect);
      stage.add(rectLayer);
    };

    var textLayer = new Layer();
    const addText = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage; 

      var newText = new Text({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        fill: Util.getRandomColor(),
        width: 150,
        height: 100,
        text: 'Text',
        fontSize: 30,
        draggable: true,
      })

      textList.value.push(newText);
      textLayer.add(newText);
      stage.add(textLayer);
    };

    var buttonLayer = new Layer();
    const addButton = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;      

      var button = new Group({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        width: 130,
        height: 25,
        draggable: true,
      });

      button.add(new Rect({
        width: 130,
        height: 25,
        fill: 'lightblue'
      }));

      button.add(new Text({
        text: 'Button',
        fontSize: 18,
        fontFamily: 'Calibri',
        fill: '#000',
        width: 130,
        padding: 5,
        align: 'center'
      }));

      buttonList.value.push(button);
      buttonLayer.add(button);
      stage.add(buttonLayer);
    };

    const handleTransformEnd = (e: KonvaEventObject<KonvaNodeEvent>) => {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const shape = rectList.value.find(
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
      } else {
        const shape = buttonList.value.find(
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
        } else {

          const shape = textList.value.find(
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
        }
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
      const shape = rectList.value.find((r) => r.id() === id);

      if (shape && !(shape instanceof Layer)) {
        selectedShapeId.value = id;
      } else {
        const shape = buttonList.value.find((r) => r.id() === id);
        if (shape && !(shape instanceof Layer)) {
          selectedShapeId.value = id;
        }else{
          const shape = buttonList.value.find((r) => r.id() === id);
          if (shape && !(shape instanceof Layer)) {
            selectedShapeId.value = id;
          } else {
            selectedShapeId.value = "";
          }
        }
       
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
      rectList,
      textList,
      buttonList,
      dragItemId,
      transformer,
      configKonva,
      userImage,
      handleDragstart,
      handleDragend,
      safeBoard,
      compare,
      addRect,
      addText,
      addButton,
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
.navigation{
  position: relative;
  width: 300px;
  height: 420px;
  background-color: #21333c;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: 0.5s;
}
.navigation ul{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.navigation ul li{
  position: relative;
  list-style: none;
  width: 100%;
}
.navigation ul li:hover {
  background-color: #4A5C66;
}
.navigation ul li a {
  position: relative;
  display: block;
  width: 100%;
  display: flex;
  text-decoration: none;
  color: #42b983;
  font-weight: 500;
}
.navigation ul li a .icon {
  position: relative;
  display: block;
  min-width: 80px;
  height: 60px;
  line-height: 60px;
  text-align: center;
}
.navigation ul li a .icon .fa{
  font-size: 24px;
}
.navigation ul li a .title {
  position: relative;
  display: block;
  height: 60px;
  line-height: 60px;
  white-space: nowrap;
}
.toggle{
  position: absolute;
  top: calc(50% - 20px);
  right: -20px;
  width: 40px;
  height: 40px;
  background-color: #4A5C66;
  cursor: pointer;
  border: 5px solid ;
  border-radius: 50%;
}
.toggle::before{
  content: 'x';
  position: absolute;
  width: 100%;
  height: 100%;
  line-height: 30px;
  text-align: center;
}

</style>
