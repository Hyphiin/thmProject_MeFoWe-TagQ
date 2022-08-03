<template>
  <div class="canvas__component">
    <div v-if="!compared" class="component">
      <button v-if="userImage && !compared" @click="compare">Compare</button>
      <v-stage
        ref="stage"
        :config="configKonva"
        @dragstart="handleDragstart"
        @dragend="handleDragend"
        @dragmove="handleDragmove"
        @mousedown="handleStageMouseDown"
        @touchstart="handleStageMouseDown"
      >
        <v-layer ref="background__layer">
          <v-rect
            :config="{
              width: 1800,
              height: 1000,
              fill: 'white',
            }"
          />
        </v-layer>
        <v-layer ref="layer">
          <v-transformer ref="transformer" />
        </v-layer>
        <v-layer ref="component__layer"> </v-layer>
      </v-stage>
    </div>
    <div class="drawer" :class="drawerIsActive ? 'active' : ''">
      <div
        id="button"
        :class="drawerIsActive ? 'active' : ''"
        v-on:click="drawerIsActive = !drawerIsActive"
      ></div>
      <div id="container">
        <div id="cont">
          <div class="drawer_center">
            <button @click="addRect">
              <span class="material-symbols-outlined"> rectangle </span>Add Rect
            </button>

            <button @click="addText">
              <span class="material-symbols-outlined"> text_fields </span>Add
              Text
            </button>
          </div>
        </div>
      </div>
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
    const width = 1300;
    const height = 1000;

    const rectList = ref<Rect[]>([]);
    const textList = ref<Text[]>([]);
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
        console.log("userImage => ", newValue);
        if (newValue) {
          userImage.value = newValue;
          result.value = undefined;
        }
      }
    );

    const handleDragstart = (e: DragEvent) => {
      if (e.target != null && e.target instanceof Rect) {
        // save drag element:
        dragItemId.value = e.target.attrs.id;
        // move current element to the top:
        const item = rectList.value.find((i) => i.id() === dragItemId.value);
        const index = rectList.value.indexOf(item as Rect);
        rectList.value.splice(index, 1);
        rectList.value.push(item as Rect);
      } else if (e.target != null && e.target instanceof Text) {
        // save drag element:
        dragItemId.value = e.target.attrs.id;
        // move current element to the top:
        const item = textList.value.find((i) => i.id() === dragItemId.value);
        const index = textList.value.indexOf(item as Text);
        textList.value.splice(index, 1);
        textList.value.push(item as Text);
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
            stage.children.splice(3, 1);

            let compareImage = "";
            stage.toDataURL({
              width: 1300,
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
      // rectLayer.clear();
      // textLayer.clear();
      // buttonLayer.clear();
      setTimeout(() => {
        drawLinesSolution();
      }, 200);
    };

    const addRect = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;

      var newRect = new Rect({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        fill: Util.getRandomColor(),
        width: 100,
        height: 100,
        draggable: true,
        stroke: Util.getRandomColor(),
        strokeWidth: Math.round(Math.random() * 5),
        cornerRadius: Math.round(Math.random() * 5),
      });
      rectList.value.push(newRect);
      if (stage.children) {
        stage.children[2].add(newRect);
      }
    };

    const addText = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;

      var newText = new Text({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width),
        y: Math.round(Math.random() * height),
        fill: Util.getRandomColor(),
        text: "Double Click to edit",
        fontSize: 30,
        draggable: true,
      });

      textList.value.push(newText);

      newText.on("dblclick dbltap", () => {
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
        var textarea = document.createElement("textarea");
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = newText.text();
        textarea.style.position = "absolute";
        textarea.style.top = areaPosition.y + "px";
        textarea.style.left = areaPosition.x + "px";
        textarea.style.width = newText.width() - newText.padding() * 2 + "px";
        textarea.style.height =
          newText.height() - newText.padding() * 2 + 5 + "px";
        textarea.style.fontSize = newText.fontSize() + "px";
        textarea.style.border = "none";
        textarea.style.padding = "0px";
        textarea.style.margin = "0px";
        textarea.style.overflow = "hidden";
        textarea.style.background = "none";
        textarea.style.outline = "none";
        textarea.style.resize = "none";
        textarea.style.lineHeight = newText.lineHeight().toString();
        textarea.style.fontFamily = newText.fontFamily();
        textarea.style.transformOrigin = "left top";
        textarea.style.textAlign = newText.align();
        textarea.style.color = newText.fill();

        var px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        var isFirefox =
          navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
        if (isFirefox) {
          px += 2 + Math.round(newText.fontSize() / 20);
        }

        // reset height
        textarea.style.height = "auto";
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + "px";

        textarea.focus();

        function removeTextarea() {
          textarea.parentNode?.removeChild(textarea);
          window.removeEventListener("click", handleOutsideClick);
          newText.show();
        }

        textarea.addEventListener("keydown", function (e) {
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

        textarea.addEventListener("keydown", function (e) {
          let scale = newText.getAbsoluteScale().x;
          textarea.style.height = "auto";
          textarea.style.height =
            textarea.scrollHeight + newText.fontSize() + "px";
        });

        function handleOutsideClick(e: any) {
          if (e.target !== textarea) {
            newText.text(textarea.value);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener("click", handleOutsideClick);
        });
      });
      if (stage.children) {
        stage.children[2].add(newText);
      }
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
        activeComponent.value = shape as Rect;
        setActiveAttributes(shape as Rect);
        selectedShapeId.value = id;
      } else {
        const shape = textList.value.find((r) => r.attrs.id === id);
        if (shape && !(shape instanceof Layer)) {
          activeComponent.value = shape;
          setActiveAttributes(shape as Text);
          selectedShapeId.value = id;
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

    let drawerIsActive = ref<boolean>(false);
    let editCompIsActive = ref<boolean>(false);
    let activeComponent = ref<Rect | Text | null>(null);

    let activeCompBgColor = ref<string>("hello");
    watch(
      () => activeCompBgColor.value,
      (newValue) => {
        console.log("watch", activeCompBgColor.value);
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;

          let id = activeComponent.value.attrs.id;
          const shape = rectList.value.find((r) => r.attrs.id === id);
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.fill = newValue;
            setActiveAttributes(shape as Rect);
          }
          // stage.add(stageLayer);
        }
      }
    );

    let activeCornerRadius = ref<number>(0);
    watch(
      () => activeCornerRadius.value,
      (newValue) => {
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;

          let id = activeComponent.value.attrs.id;
          const shape = rectList.value.find((r) => r.attrs.id === id);
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.cornerRadius = parseInt(newValue.toString());
            setActiveAttributes(shape as Rect);
          }
          // stage.add(stageLayer);
        }
      }
    );

    let activeStroke = ref<string>("");
    watch(
      () => activeStroke.value,
      (newValue) => {
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;
          let id = activeComponent.value.attrs.id;
          const shape = rectList.value.find((r) => r.attrs.id === id);
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.stroke = newValue;
            setActiveAttributes(shape as Rect);
          }
          // stage.add(stageLayer);
        }
      }
    );

    let activeStrokeWidth = ref<number>(0);
    watch(
      () => activeStrokeWidth.value,
      (newValue) => {
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;
          let id = activeComponent.value.attrs.id;
          const shape = rectList.value.find((r) => r.attrs.id === id);
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.strokeWidth = parseInt(newValue.toString());
            setActiveAttributes(shape as Rect);
          }
          // stage.add(stageLayer);
        }
      }
    );

    let activeFontSize = ref<number>(0);
    watch(
      () => activeFontSize.value,
      (newValue) => {
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;
          let id = activeComponent.value.attrs.id;
          const shape = textList.value.find((r) => r.attrs.id === id);
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.fontSize = parseInt(newValue.toString());
            setActiveAttributes(shape as Text);
          }
          // stage.add(stageLayer);
        }
      }
    );

    const setActiveAttributes = (activeComp: Rect | Text) => {
      activeCompBgColor.value = activeComp.attrs.fill;
      activeCornerRadius.value = activeComp.attrs.cornerRadius;
      activeStroke.value = activeComp.attrs.stroke;
      activeStrokeWidth.value = activeComp.attrs.strokeWidth;
      activeFontSize.value = activeComp.attrs.fontSize;
    };

    return {
      rectList,
      textList,
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
      handleTransformEnd,
      handleStageMouseDown,
      updateTransformer,
      drawLinesSolution,
      handleDragmove,
      drawerIsActive,
      editCompIsActive,
      activeComponent,
      activeCompBgColor,
      activeCornerRadius,
      activeStroke,
      activeStrokeWidth,
      activeFontSize,
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
  cursor: pointer;
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

.drawer #edit-container {
  margin-top: 5px;
  width: 100%;
  height: 50%;
  position: relative;
  top: 0;
  left: 0;
  background-color: #21333c;
  color: #21333c;
}

.drawer_center {
  width: 500px;
  text-align: center;
  display: flex;
  flex-wrap: wrap;
}

.drawer_center button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 90px;
  height: 90px;
  margin: 10px;
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #80ba24;
  color: white;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.drawer_center button span {
  font-size: 32px;
}
.drawer_center button:hover {
  background-color: #6ca512;
}
.drawer_center .edit-component-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 150px;
  height: 40px;
  margin: 10px;
  padding: 6px 10px;
  font-weight: bold;
  border-radius: 3px;
  background-color: #80ba24;
  color: white;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.drawer_center .edit-component-btn span {
  font-size: 24px;
}

.drawer_center .edit-component-btn:hover {
  background-color: #6ca512;
}

.drawer h3 {
  font-size: 30px;
  font-weight: 100;
  margin-top: 70px;
  margin-left: 40px;
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

.edit-comp_div {
  font-size: 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
}
</style>
