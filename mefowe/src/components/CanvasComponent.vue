<template>
  <div class="canvas__component">
    <div v-if="!compared" class="component">
      <button @click="addRect">Add Rect</button>
      <button @click="addText">Add Text</button>
      <button @click="addButton">Add Button</button>
      <button v-if="userImage && !compared" @click="compare">Compare</button>
      <v-stage
        ref="stage"
        :config="configKonva"
        style="background-color: white"
        @dragstart="handleDragstart"
        @dragend="handleDragend"
        @dragmove="handleDragmove"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
      >
        <v-layer ref="layer">
          <v-transformer ref="transformer" />
        </v-layer>
      </v-stage>
    </div>
    <div class="wrap">
      <div class="modal js-modal">
        <div v-if="result" class="modal-image">
          <svg
            v-if="100 - result.misMatchPercentage > 75"
            viewBox="0 0 32 32"
            style="fill: #48db71"
          >
            <path d="M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z"></path>
          </svg>
          <svg
            v-else-if="
              100 - result.misMatchPercentage > 25 &&
              100 - result.misMatchPercentage < 75
            "
            viewBox="0 0 32 32"
            style="fill: #ffff00"
          >
            <path d="M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z"></path>
          </svg>
          <svg
            v-else-if="100 - result.misMatchPercentage < 25"
            viewBox="0 0 32 32"
            style="fill: #ff0000"
          >
            <path d="M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z"></path>
          </svg>
        </div>
        <h1 v-if="result">
          {{ 100 - result.misMatchPercentage }}% Übereinstimmung konnte
          festgestellt werden.
        </h1>
        <div v-else class="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <button v-if="compared" @click="nextQuestion">Nächste Frage</button>
        <div id="container__images"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import { Group } from "konva/lib/Group";
import { Util } from "konva/lib/Util";
import { KonvaEventObject } from "konva/lib/Node";
import { KonvaNodeEvent } from "konva/lib/types";
import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import resemble from "resemblejs";
import { Line } from "konva/lib/shapes/Line";
//import DrawerComponent from "@/components/DrawerComponent.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Canvas",
  components: {},
  props: {
    createdImage: {
      type: String,
    },
  },
  emits: {
    nextQuestion(): boolean {
      return true;
    },
  },
  setup(props, context) {
    const width = 1800;
    const height = 1000;

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

    onMounted(() => {
      drawLinesSolution();
    });

    const userImage = ref<string | undefined>(props.createdImage);

    watch(
      () => props.createdImage,
      (newValue) => {
        console.log("userImage => ", newValue);
        if (newValue) {
          userImage.value = newValue;
          result.value = undefined;
        }
      }
    );

    const handleDragstart = (e: DragEvent) => {
      if (e.target != null && e.target instanceof HTMLElement) {
        // save drag element:
        dragItemId.value = e.target.id;
        // move current element to the top:
        console.log(e.target);
        const item = rectList.value.find((i) => i.id() === dragItemId.value);
        const index = rectList.value.indexOf(item as Rect);
        rectList.value.splice(index, 1);
        rectList.value.push(item as Rect);
      }
    };
    const handleDragend = () => {
      guideLines.find(".guid-line").forEach((l) => l.destroy());
      dragItemId.value = "";
    };

    const result = ref<resemble.ComparisonResult>();

    const compared = ref<boolean>(false);

    const isComparing = ref<boolean>(false);

    const compare = () => {
      isComparing.value = true;
      for (var i = document.images.length; i-- > 0; )
        document!.images[i]!.parentNode!.removeChild(document.images[i]);

      if (userImage.value) {
        const comparisonImg = new Image();
        comparisonImg.src = userImage.value;
        comparisonImg.width = 600;
        comparisonImg.height = 380;
        comparisonImg.style.margin = "20px";
        comparisonImg.style.marginTop = "80px";
        comparisonImg.style.border = "medium solid grey";
        comparisonImg.style.borderRadius = "8px";

        const container = document.getElementById("container__images");

        if (container !== null) {
          container.appendChild(comparisonImg);

          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;

          if (stage.children) {
            stage.children.splice(1, 1);

            console.log(stage);

            let compareImage = "";
            stage.toDataURL({
              width: 1800,
              height: 1000,
              callback(img) {
                compareImage = img;
              },
            });

            const canvasImg = new Image();
            canvasImg.src = compareImage;
            canvasImg.width = 600;
            canvasImg.height = 380;
            canvasImg.style.margin = "20px";
            canvasImg.style.marginTop = "80px";
            canvasImg.style.border = "medium solid grey";
            canvasImg.style.borderRadius = "8px";

            container.appendChild(canvasImg);

            console.log(userImage.value);
            console.log(compareImage);

            resemble(userImage.value)
              .compareTo(compareImage)
              .ignoreLess()
              .onComplete(function (data) {
                console.log(data);
                result.value = data;
                compared.value = true;
              });
          }
        }
      }

      isComparing.value = false;
    };

    const nextQuestion = () => {
      compared.value = false;
      result.value = undefined;
      userImage.value = undefined;
      for (var i = document.images.length; i-- > 0; )
        document!.images[i]!.parentNode!.removeChild(document.images[i]);

      context.emit("nextQuestion");
      rectLayer.clear();
      textLayer.clear();
      buttonLayer.clear();
      setTimeout(() => {
        drawLinesSolution();
      }, 200);
    };

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
      });
      rectList.value.push(newRect);
      rectLayer.add(newRect);
      stage.add(rectLayer);
    };

    const stepSize = 50;
    var gridLayer = new Layer();
    function drawLinesSolution() {
      // set clip function to stop leaking lines into non-viewable space.

      const // find the x & y size of the grid
        xSize = width,
        ySize = height,
        // compute the number of steps required on each axis.
        xSteps = Math.round(xSize / stepSize),
        ySteps = Math.round(ySize / stepSize);

      // draw vertical lines
      for (let i = 0; i <= xSteps; i++) {
        gridLayer.add(
          new Line({
            x: 0 + i * stepSize,
            y: 0,
            points: [0, 0, 0, ySize],
            stroke: "black",
            strokeWidth: 1,
          })
        );
      }
      //draw Horizontal lines
      for (let i = 0; i <= ySteps; i++) {
        gridLayer.add(
          new Line({
            x: 0,
            y: 0 + i * stepSize,
            points: [0, 0, xSize, 0],
            stroke: "black",
            strokeWidth: 1,
          })
        );
      }
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      stage.add(gridLayer);
    }

    var GUIDELINE_OFFSET = 5;
    // were can we snap our objects?
    function getLineGuideStops(skipShape: any) {
      // we can snap to stage borders and the center of the stage
      var vertical: any = [0, width / 2, width];
      var horizontal: any = [0, height / 2, height];

      // and we snap over edges and center of each object on the canvas
      rectList.value.forEach((guideItem) => {
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

    function getObjectSnappingEdges(node: any) {
      var box = node.getClientRect();
      var absPos = node.absolutePosition();

      return {
        vertical: [
          {
            guide: Math.round(box.x),
            offset: Math.round(absPos.x - box.x),
            snap: "start",
          },
          {
            guide: Math.round(box.x + box.width / 2),
            offset: Math.round(absPos.x - box.x - box.width / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.x + box.width),
            offset: Math.round(absPos.x - box.x - box.width),
            snap: "end",
          },
        ],
        horizontal: [
          {
            guide: Math.round(box.y),
            offset: Math.round(absPos.y - box.y),
            snap: "start",
          },
          {
            guide: Math.round(box.y + box.height / 2),
            offset: Math.round(absPos.y - box.y - box.height / 2),
            snap: "center",
          },
          {
            guide: Math.round(box.y + box.height),
            offset: Math.round(absPos.y - box.y - box.height),
            snap: "end",
          },
        ],
      };
    }

    // find all snapping possibilities
    function getGuides(lineGuideStops: any, itemBounds: any) {
      var resultV: any[] = [];
      var resultH: any[] = [];

      lineGuideStops.vertical.forEach((lineGuide: number) => {
        itemBounds.vertical.forEach(
          (itemBound: { guide: number; snap: any; offset: any }) => {
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
          }
        );
      });

      lineGuideStops.horizontal.forEach((lineGuide: number) => {
        itemBounds.horizontal.forEach(
          (itemBound: { guide: number; snap: any; offset: any }) => {
            var diff = Math.abs(lineGuide - itemBound.guide);
            if (diff < GUIDELINE_OFFSET) {
              resultH.push({
                lineGuide: lineGuide,
                diff: diff,
                snap: itemBound.snap,
                offset: itemBound.offset,
              });
            }
          }
        );
      });

      var guides = [];

      // find closest snap
      var minV = resultV.sort((a, b) => a.diff - b.diff)[0];
      var minH = resultH.sort((a, b) => a.diff - b.diff)[0];
      if (minV) {
        guides.push({
          lineGuide: minV.lineGuide,
          offset: minV.offset,
          orientation: "V",
          snap: minV.snap,
        });
      }
      if (minH) {
        guides.push({
          lineGuide: minH.lineGuide,
          offset: minH.offset,
          orientation: "H",
          snap: minH.snap,
        });
      }
      return guides;
    }

    var guideLines = new Layer();
    function drawGuides(guides: any) {
      guides.forEach((lg: { orientation: string; lineGuide: any }) => {
        if (lg.orientation === "H") {
          var line = new Line({
            points: [-6000, 0, 6000, 0],
            stroke: "rgb(0, 161, 255)",
            strokeWidth: 1,
            name: "guid-line",
            dash: [4, 6],
          });
          guideLines.add(line);
          line.absolutePosition({
            x: 0,
            y: lg.lineGuide,
          });
        } else if (lg.orientation === "V") {
          var line2 = new Line({
            points: [0, -6000, 0, 6000],
            stroke: "rgb(0, 161, 255)",
            strokeWidth: 1,
            name: "guid-line",
            dash: [4, 6],
          });
          guideLines.add(line2);
          line2.absolutePosition({
            x: lg.lineGuide,
            y: 0,
          });
        }
      });
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      stage.add(guideLines);
    }

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
        text: "Text",
        fontSize: 30,
        draggable: true,
      });

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

      button.add(
        new Rect({
          width: 130,
          height: 25,
          fill: "lightblue",
        })
      );

      button.add(
        new Text({
          text: "Button",
          fontSize: 18,
          fontFamily: "Calibri",
          fill: "#000",
          width: 130,
          padding: 5,
          align: "center",
        })
      );

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

    const handleDragmove = (e: KonvaEventObject<KonvaNodeEvent>) => {
      // clear all previous lines on the screen
      guideLines.find(".guid-line").forEach((l) => l.destroy());

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
          case "start": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case "center": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
                absPos.y = lg.lineGuide + lg.offset;
                break;
              }
            }
            break;
          }
          case "end": {
            switch (lg.orientation) {
              case "V": {
                absPos.x = lg.lineGuide + lg.offset;
                break;
              }
              case "H": {
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
        } else {
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
      result,
      compared,
      isComparing,
      compare,
      nextQuestion,
      addRect,
      addText,
      addButton,
      handleTransformEnd,
      handleStageMouseDown,
      updateTransformer,
      drawLinesSolution,
      handleDragmove,
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

.navigation {
  position: relative;
  width: 300px;
  height: 420px;
  background-color: #21333c;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: 0.5s;
}

.navigation ul {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.navigation ul li {
  position: relative;
  list-style: none;
  width: 100%;
}

.navigation ul li:hover {
  background-color: #4a5c66;
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

.navigation ul li a .icon .fa {
  font-size: 24px;
}

.navigation ul li a .title {
  position: relative;
  display: block;
  height: 60px;
  line-height: 60px;
  white-space: nowrap;
}

.toggle {
  position: absolute;
  top: calc(50% - 20px);
  right: -20px;
  width: 40px;
  height: 40px;
  background-color: #4a5c66;
  cursor: pointer;
  border: 5px solid;
  border-radius: 50%;
}

.toggle::before {
  content: "x";
  position: absolute;
  width: 100%;
  height: 100%;
  line-height: 30px;
  text-align: center;
}

#comparison__container {
  color: white;
}

.wrap {
  margin: auto;
}

.modal {
  background-color: #fff;
  padding: 2em 3em;
  text-align: center;
  border-radius: 0.5em;
  display: block;
}
.modal-image {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border-radius: 50%;
  /* box-shadow: 0 0 0 2px #48db71; */
  padding: 11px 10px 2px;
  margin-bottom: 2em;
}

h1 {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
}

p {
  margin-bottom: 2em;
  color: #666;
}

button {
  font-size: 1.25em;
  font-weight: bold;
  background-color: #000;
  border: none;
  padding: 0.5em 1em;
  color: #fff;
  box-shadow: 0 0 0 2px #000 inset;
  border-radius: 0.25em;
  cursor: pointer;
  transition: background 0.4s ease, color 0.4s ease;
}
button:hover {
  box-shadow: 0 0 0 2px #000 inset;
  color: #000;
  background-color: transparent;
}
</style>
