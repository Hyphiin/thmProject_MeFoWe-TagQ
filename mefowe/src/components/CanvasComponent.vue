<template>
  <div class="canvas">
    <button @click="addRect">Add Rect</button>
    <button @click="addText">Add Text</button>
    <button @click="addButton">Add Button</button>
    <button @click="safeBoard">Safe Board</button>
    <button @click="compare">Compare</button>
    <v-stage ref="stage" :config="configKonva" @dragstart="handleDragstart" @dragend="handleDragend"
      @dragmove="handleDragmove" @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
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
      <v-layer ref="layer-guide">
        <v-line v-for="[idx, item] in Object.entries(guideLines)" :key="idx" :config="{
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
          name: 'rectangle',
        }" @transformend="handleTransformEnd" />
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
import { defineComponent, onMounted, ref } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Util } from "konva/lib/Util";
import { KonvaEventListener, KonvaEventObject, Node } from "konva/lib/Node";
import { KonvaNodeEvent } from "konva/lib/types";
import { Stage, StageConfig } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import { Line } from "konva/lib/shapes/Line"
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
    const list = ref<Rect[]>([]);
    const gridLines = ref<Line[]>([]);
    const guideLines = ref<Line[]>([]);
    const dragItemId = ref<string>();

    const selectedShapeId = ref<string>();

    const transformer = ref<any>();

    var GUIDELINE_OFFSET = 5;

    const configKonva = ref({
      width: width,
      height: height,
    });
    onMounted(() => {
      drawLinesSolution();
    })

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
        guideLines.value.splice(0, guideLines.value.length);
      }
    };

    const handleDragmove = (e: any) => {
      // clear all previous lines on the screen

      // find possible snapping lines
      var lineGuideStops = getLineGuideStops(e.target);
      // find snapping points of current object
      var itemBounds = getObjectSnappingEdges(e.target);

      // now find where can we snap current object
      var guides = getGuides(lineGuideStops, itemBounds);

      // do nothing of no snapping
      if (!guides.length) {
        return;
      }

      drawGuides(guides);

      var absPos = e.target.absolutePosition();
      // now force object position
      guides.forEach((lg) => {
        switch (lg.snap) {
          case 'start': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case 'center': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case 'end': {
            switch (lg.orientation) {
              case 'V': {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case 'H': {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
        }
      });
      e.target.absolutePosition(absPos);
    };
  const handleDragend = () => {
    dragItemId.value = "";
    guideLines.value.splice(0, guideLines.value.length);
    console.log(gridLines.value)
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

    const stepSize = 50;
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
          y: 0,
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
          x: 0,
          y: 0 + i * stepSize,
          points: [0, 0, xSize, 0],
          stroke: 'rgba(0, 0, 0, 0.2)',
          strokeWidth: 1,
        })
      );
    }
    console.log(gridLines)
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

  // // were can we snap our objects?
  const getLineGuideStops = (skipShape: any) => {
    // we can snap to stage borders and the center of the stage
    var vertical: any = [0, width / 2, width];
    var horizontal: any = [0, height / 2, height];

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
       
    // and we snap over edges and center of each object on the canvas

    list.value.forEach((guideItem: any) => {
      if (guideItem === skipShape) {
        return;
      }
      var box = guideItem.getClientRect();
      // and we can snap to all edges of shapes
      vertical.push([box.x, box.x + box.width, box.x + box.width / 2]);
      horizontal.push([box.y, box.y + box.height, box.y + box.height / 2]);
    });
    return {
      vertical: vertical.flat(),
      horizontal: horizontal.flat(),
    };
  }

    // what points of the object will trigger to snapping?
    // it can be just center of the object
    // but we will enable all edges and center
    function getObjectSnappingEdges(node: any) {
  var box = node.getClientRect();
  var absPos = node.absolutePosition();

  return {
    vertical: [
      {
        guide: Math.round(box.x),
        offset: Math.round(absPos.x - box.x),
        snap: 'start',
      },
      {
        guide: Math.round(box.x + box.width / 2),
        offset: Math.round(absPos.x - box.x - box.width / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.x + box.width),
        offset: Math.round(absPos.x - box.x - box.width),
        snap: 'end',
      },
    ],
    horizontal: [
      {
        guide: Math.round(box.y),
        offset: Math.round(absPos.y - box.y),
        snap: 'start',
      },
      {
        guide: Math.round(box.y + box.height / 2),
        offset: Math.round(absPos.y - box.y - box.height / 2),
        snap: 'center',
      },
      {
        guide: Math.round(box.y + box.height),
        offset: Math.round(absPos.y - box.y - box.height),
        snap: 'end',
      },
    ],
  };
}

    // find all snapping possibilities
    function getGuides(lineGuideStops: any, itemBounds: any) {
    var resultV: any = [];
    var resultH: any = [];

    lineGuideStops.vertical.forEach((lineGuide: any) => {
      itemBounds.vertical.forEach((itemBound: any) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        // if the distance between guild line and object snap point is close we can consider this for snapping
        if (diff < GUIDELINE_OFFSET) {
          resultV.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    lineGuideStops.horizontal.forEach((lineGuide: any) => {
      itemBounds.horizontal.forEach((itemBound: any) => {
        var diff = Math.abs(lineGuide - itemBound.guide);
        if (diff < GUIDELINE_OFFSET) {
          resultH.push({
            lineGuide: lineGuide,
            diff: diff,
            snap: itemBound.snap,
            offset: itemBound.offset,
          });
        }
      });
    });

    var guides = [];

    // find closest snap
    var minV = resultV.sort((a: any, b: any) => a.diff - b.diff)[0];
    var minH = resultH.sort((a: any, b: any) => a.diff - b.diff)[0];
    if (minV) {
      guides.push({
        lineGuide: minV.lineGuide,
        offset: minV.offset,
        orientation: 'V',
        snap: minV.snap,
      });
    }
    if (minH) {
      guides.push({
        lineGuide: minH.lineGuide,
        offset: minH.offset,
        orientation: 'H',
        snap: minH.snap,
      });
    }
    return guides;
  }

    function drawGuides(guides: any) {
    guides.forEach((lg: any) => {
      if (lg.orientation === 'H') {
        var line = new Line({
          points: [-6000, 0, 6000, 0],
          stroke: 'rgb(0, 161, 255)',
          strokeWidth: 1,
          name: 'guid-line',
          dash: [4, 6],
        });
        guideLines.value.push(line);
        line.absolutePosition({
          x: 0,
          y: lg.lineGuide,
        });
      } else if (lg.orientation === 'V') {
        var line2 = new Line({
          points: [0, -6000, 0, 6000],
          stroke: 'rgb(0, 161, 255)',
          strokeWidth: 1,
          name: 'guid-line',
          dash: [4, 6],
        });
        guideLines.value.push(line2);
        line2.absolutePosition({
          x: lg.lineGuide,
          y: 0,
        });
      }
    });
  }

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
  guideLines,
  handleDragstart,
  handleDragmove,
  handleDragend,
  safeBoard,
  compare,
  addRect,
  handleTransformEnd,
  getLineGuideStops,
  getObjectSnappingEdges,
  drawGuides,
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
