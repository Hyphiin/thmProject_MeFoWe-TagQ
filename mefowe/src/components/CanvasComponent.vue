<template>
  <div class="canvas__component">
    <button v-if="userImage" @click="compare">Compare</button>
    <button v-if="compared" @click="nextQuestion">Nächstes Level</button>
    <!-- <button @click="safeBoard">Safe Board</button> -->
    <v-stage ref="stage" :config="configKonva" @dragstart="handleDragstart" @dragend="handleDragend"
      @dragmove="handleDragmove" @mousedown="handleStageMouseDown" @touchstart="handleStageMouseDown">
      <v-layer ref="layer">
        <v-transformer ref="transformer" />
      </v-layer>
    </v-stage>
    <div class="drawer" :class="drawerIsActive?'active':''">
      <div id="button" :class="drawerIsActive ? 'active' :''" v-on:click="drawerIsActive=!drawerIsActive">
      </div>
      <div id="container">
        <div id="cont">
          <div class="drawer_center">
            <button @click="addRect">Add Rect</button>
            <button @click="addText">Add Text</button>
            <button @click="addButton">Add Button</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { Rect } from "konva/lib/shapes/Rect";
import { Text } from "konva/lib/shapes/Text";
import { Transformer } from "konva/lib/shapes/Transformer";
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
  components: { },
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
    const width = window.innerWidth * 0.66;
    const height = window.innerHeight * 0.85;

    const rectList = ref<Rect[]>([]);
    const textList = ref<Text[]>([]);
    const buttonList = ref<Group[]>([]);
    const dragItemId = ref<string>("");
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
        if (newValue) {
          userImage.value = newValue;
        }
      }
    );

    const handleDragstart = (e: DragEvent) => {
      console.log("handleDragstart", e.target)
      if (e.target != null && e.target instanceof Rect) {
        // save drag element:
        dragItemId.value = e.target.attrs.id
        // move current element to the top:
        console.log("handleDragstart2",e.target);
        const item = rectList.value.find((i) => i.id() === dragItemId.value);
        const index = rectList.value.indexOf(item as Rect);
        rectList.value.splice(index, 1);
        rectList.value.push(item as Rect);
      } else if (e.target != null && e.target instanceof Text) {
        // save drag element:
        dragItemId.value = e.target.attrs.id
        // move current element to the top:
        console.log("handleDragstart2", e.target);
        const item = textList.value.find((i) => i.id() === dragItemId.value);
        const index = textList.value.indexOf(item as Text);
        textList.value.splice(index, 1);
        textList.value.push(item as Text);
      } else if (e.target != null && e.target instanceof Group) {
        // save drag element:
        dragItemId.value = e.target.attrs.id
        // move current element to the top:
        console.log("handleDragstart2", e.target);
        const item = buttonList.value.find((i) => i.id() === dragItemId.value);
        const index = buttonList.value.indexOf(item as Group);
        buttonList.value.splice(index, 1);
        buttonList.value.push(item as Group);
      }
    };
    const handleDragend = () => {
      guideLines.find(".guid-line").forEach((l) => l.destroy());
      dragItemId.value = "";
    };

    const safeBoard = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      // stage.toDataURL({
      //   pixelRatio: 2,
      //   callback(img) {
      //     userImage = img;
      //   },
      // });
    };

    const compared = ref<boolean>(false);

    const compare = () => {
      if (userImage.value) {
        const transformerNode = transformer.value.getNode();
        const stage = transformerNode.getStage() as Stage;
        let compareImage = "";
        stage.toDataURL({
          pixelRatio: 2,
          callback(img) {
            compareImage = img;
          },
        });

        resemble(userImage.value)
          .compareTo(compareImage)
          .ignoreColors()
          .onComplete(function (data) {
            console.log(data);
            compared.value = true;
          });
      }
    };

    const nextQuestion = () => {
      compared.value = false;

      context.emit("nextQuestion");

      setTimeout(() => {
        // const transformerNode = transformer.value.getNode();
        // const stage = transformerNode.getStage() as Stage;

        // stage.clear();
        stageLayer.clear();
      }, 2000);
    };

    //Components
    var stageLayer = new Layer();
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
      stageLayer.add(newRect);
      stage.add(stageLayer);
    };

    const addText = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;

      var newText = new Text({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        fill: Util.getRandomColor(),
        width: 280,
        height: 100,
        text: "Double Click to edit",
        fontSize: 30,
        draggable: true,
      });

      textList.value.push(newText);
      stageLayer.add(newText);     

      newText.on('dblclick dbltap', () => {
        // hide text node and transformer:
        newText.hide();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = newText.absolutePosition();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = newText.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = newText.width() - newText.padding() * 2 + 'px';
        textarea.style.height =
          newText.height() - newText.padding() * 2 + 5 + 'px';
        textarea.style.fontSize = newText.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = newText.lineHeight().toString();
        textarea.style.fontFamily = newText.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = newText.align();
        textarea.style.color = newText.fill();

        var px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        var isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          px += 2 + Math.round(newText.fontSize() / 20);
        }

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        textarea.focus();

        function removeTextarea() {
          textarea.parentNode?.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          newText.show();
        }

        textarea.addEventListener('keydown', function (e) {
          // hide on enter
          // but don't hide on shift + enter
          if (e.keyCode === 13 && !e.shiftKey) {
            newText.text(textarea.value);
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.keyCode === 27) {
            removeTextarea();
          }
        });

        textarea.addEventListener('keydown', function (e) {
          let scale = newText.getAbsoluteScale().x;
          textarea.style.height = 'auto';
          textarea.style.height =
            textarea.scrollHeight + newText.fontSize() + 'px';
        });

        function handleOutsideClick(e: any) {
          if (e.target !== textarea) {
            newText.text(textarea.value);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
      });
      stage.add(stageLayer);
    };

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
      stageLayer.add(button);
      stage.add(stageLayer);
    };

    //Lines
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

    //Transform Components
    const handleTransformEnd = (e: KonvaEventObject<KonvaNodeEvent>) => {
      // shape is transformed, let us save new attrs back to the node
      // find element in our state
      const shape = rectList.value.find(
        (r) => r.id() === selectedShapeId.value
      )!.attrs;

      if (shape && !(shape instanceof Layer)) {
        console.log("SHAPE", shape)
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
          console.log("handleTransformEnd Text")
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
            console.log("handleTransformEnd Button")
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
      let id = e.target.attrs.id;
      const shape = rectList.value.find((r) => r.attrs.id === id);
      if (shape && !(shape instanceof Layer)) {
        console.log("SHAPERECT", shape)
        selectedShapeId.value = id;
      } else {
        const shape = textList.value.find((r) => r.attrs.id === id);
        if (shape && !(shape instanceof Layer)) {
          console.log("handleStageMouseDown Text")
          selectedShapeId.value = id;
        } else {
          id = e.target.parent?.attrs.id
          const shape = buttonList.value.find((r) => r.attrs.id === id);
          console.log("SHAPEBUTTON", id)
          console.log("SHAPEBUTTON", buttonList.value)
          if (shape && !(shape instanceof Layer)) {
            console.log("handleStageMouseDown Button")
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

    let drawerIsActive = ref<boolean>(false)

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
      compared,
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
      drawerIsActive
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

.drawer #button {
  width: 35px;
  height: 35px;
  border: #80ba24 12px solid;
  border-radius: 35px;
  margin: 0 auto;
  position: inherit;
  top: 30%;
  right: -25px;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  z-index: 9999;
  cursor:pointer;
}

.drawer #button.active {
  width: 35px;
  height: 35px;
  border: #80ba24 12px solid;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  cursor: pointer;
}

.drawer {
  top: 110px;
  right: -32px;
  position: fixed;
  width: 2em;
  height: 50%;
  overflow: hidden;
  margin: 0 auto;
  border-radius: 6px;
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  z-index: 999;
}

.drawer.active {
  -webkit-transition: all 1s ease;
  -moz-transition: all 1s ease;
  -o-transition: all 1s ease;
  -ms-transition: all 1s ease;
  transition: all 1s ease;
  width: 13em;
}

.drawer #container {
  margin-top: 5px;
  width: 100%;
  height: 100%;
  position: relative;
  top: 0;
  left: 0;
  background-color: #21333c;
  color: #21333c;
}

.drawer #cont {
  height: auto;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
}

.drawer_center {
  width: 500px;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
}

.drawer_center button {
  width: 100px;
  height: 100px;
  margin-left: 15px;
  margin-top: 15px;
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #80ba24;
  color: white;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.drawer_center button:hover {
  width: 105px;
  height: 105px;

  -webkit-transition: all 1s ease;
    -moz-transition: all 1s ease;
    -o-transition: all 1s ease;
    -ms-transition: all 1s ease;
    transition: all 1s ease;
  
}

.drawer h3 {
  font-size: 30px;
  font-weight: 100;
  margin-top: 70px;
  margin-left: 40px;
}
</style>
