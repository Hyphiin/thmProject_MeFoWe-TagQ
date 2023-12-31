<template>
  <div class="canvas__component">
    <div v-if="!compared" class="component">
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
              height: 1100,
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
    <nav class="top-nav">
      <div
        class="menu-wrapper"
        :class="[
          drawerIsActive ? 'is-opened' : '',
          activeComponent !== null ? 'is-editBtn' : '',
          editCompIsActive ? 'is-edit' : '',
        ]"
      >
        <div id=" container">
          <div id="cont">
            <div class="drawer_center">
              <button id="component-btn" @click="addRect">
                <span class="material-symbols-outlined"> rectangle </span>Add
                Rect
              </button>

              <button id="component-btn" @click="addText">
                <span class="material-symbols-outlined"> text_fields </span>Add
                Text
              </button>
            </div>
          </div>
        </div>
        <div v-if="activeComponent !== null" id="edit-container">
          <div id="cont">
            <div class="drawer_edit">
              <button
                class="edit-component-btn"
                @click="editCompIsActive = !editCompIsActive"
              >
                <span class="material-symbols-outlined"> settings </span>Edit
                Component
              </button>
              <div class="edit-comp_div" v-if="editCompIsActive">
                <div class="edit-comp__sections">
                  Background-Color:
                  <input class="sections__input" v-model="activeCompBgColor" />
                </div>
                <div
                  class="edit-comp__sections"
                  v-if="activeComponent.className !== 'Text'"
                >
                  Border:
                  <input class="sections__input" v-model="activeStroke" />
                </div>
                <div
                  class="edit-comp__sections"
                  v-if="activeComponent.className !== 'Text'"
                >
                  BorderWidth:
                  <input class="sections__input" v-model="activeStrokeWidth" />
                </div>
                <div
                  class="edit-comp__sections"
                  v-if="activeComponent.className !== 'Text'"
                >
                  Border-Radius:
                  <input class="sections__input" v-model="activeCornerRadius" />
                </div>
                <div
                  class="edit-comp__sections"
                  v-if="activeComponent.className === 'Text'"
                >
                  Font-Size:
                  <input class="sections__input" v-model="activeFontSize" />
                </div>
                <button id="delete-btn" @click="deleteComp">
                  <span class="material-symbols-outlined"> delete </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="fixed-menu">
        <img
          src="../../public/MeFoWeLogoWhite.png"
          alt="HTML/CSS Quiz Logo"
          width="40"
          height="20"
        />
        <button
          class="menu-open"
          aria-label="open menu"
          @click="drawerIsActive = !drawerIsActive"
        >
          <span class="material-symbols-outlined">
            {{
              drawerIsActive
                ? "keyboard_double_arrow_right"
                : "keyboard_double_arrow_left"
            }}
          </span>
        </button>
      </div>
    </nav>
    <div v-if="userImage" class="wrap">
      <div class="modal js-modal">
        <button v-if="!compared" @click="compare">Compare</button>
        <div v-if="result" class="modal-image">
          <span
            v-if="100 - result.misMatchPercentage > 95"
            class="material-symbols-outlined"
          >
            star
          </span>
          <span
            v-else-if="
              100 - result.misMatchPercentage > 85 &&
              100 - result.misMatchPercentage < 95
            "
            class="material-symbols-outlined"
          >
            done
          </span>
          <span
            v-else-if="100 - result.misMatchPercentage < 85"
            class="material-symbols-outlined"
          >
            close
          </span>
        </div>
        <h1 v-if="result">
          {{ 100 - result.misMatchPercentage }}% Übereinstimmung konnte
          festgestellt werden.
        </h1>
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
import { Group } from "konva/lib/Group";

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
    const width = ref<number>(1600)   
    const height = ref<number>(1100)
    if (window.innerWidth < 1441) {
      width.value =  800
      height.value = 600
    } else if (window.innerWidth < 1601) {
      width.value = 1000
      height.value = 800
    } else if (window.innerWidth < 1921) {
      width.value = 1200
      height.value = 1000
    }
  
    

    //helper Lists to update styles later
    const rectList = ref<Rect[]>([]);
    const textList = ref<Text[]>([]);
    
    const dragItemId = ref<string>("");
    const selectedShapeId = ref<string>();
    const transformer = ref<any>();
    const configKonva = ref({
      width: width,
      height: height.value,
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

    //---- Compare Feature
    const result = ref<resemble.ComparisonResult>();
    const compared = ref<boolean>(false);
    const isComparing = ref<boolean>(false);

    const compare = () => {
      isComparing.value = true;
      for (var i = document.images.length; i-- > 0; )
        document!.images[i]!.parentNode!.removeChild(document.images[i]);
        let imgWidth = 600
        let imgHeight = 380
      if (window.innerWidth< 1441){
        imgWidth = 400
        imgHeight = 280
      }

      if (userImage.value) {
        const comparisonImg = new Image();
        comparisonImg.src = userImage.value;
        comparisonImg.width = imgWidth;
        comparisonImg.height = imgHeight;
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
            stage.children.splice(1, 1);

            let compareImage = "";
            stage.toDataURL({
              width: width.value,
              height: height.value,
              callback(img) {
                compareImage = img;
              },
            });

            const canvasImg = new Image();
            canvasImg.src = compareImage;
            canvasImg.width = imgWidth;
            canvasImg.height = imgHeight;
            canvasImg.style.margin = "20px";
            canvasImg.style.marginTop = "80px";
            canvasImg.style.border = "medium solid grey";
            canvasImg.style.borderRadius = "8px";

            container.appendChild(canvasImg);

            resemble(userImage.value)
              .compareTo(compareImage)
              .ignoreLess()
              .onComplete(function (data) {
                result.value = data;
                compared.value = true;
              });
          }
        }
      }

      isComparing.value = false;
    };

    //---- next Question from strore is loading
    const nextQuestion = () => {
      compared.value = false;
      result.value = undefined;
      userImage.value = undefined;
      for (var i = document.images.length; i-- > 0; )
        document!.images[i]!.parentNode!.removeChild(document.images[i]);

      context.emit("nextQuestion");
      setTimeout(() => {
        drawLinesSolution();
      }, 200);
    };

    //---- Function to add a Rectangle to the Layer
    const addRect = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      //create the new Rect
      var newRect = new Rect({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width.value),
        y: Math.round(Math.random() * height.value),
        fill: Util.getRandomColor(),
        width: 100,
        height: 100,
        draggable: true,
        stroke: Util.getRandomColor(),
        strokeWidth: Math.round(Math.random() * 5),
        cornerRadius: Math.round(Math.random() * 5),
      });
      rectList.value.push(newRect);
      // add new Rect to Layer 3
      if (stage.children) {
        stage.children[2].add(newRect);
      }
    };

    //---- Function to add a Text to the Layer
    const addText = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      //create the new Text
      var newText = new Text({
        id: Math.round(Math.random() * 10000).toString(),
        x: Math.round(Math.random() * width.value),
        y: Math.round(Math.random() * height.value),
        fill: Util.getRandomColor(),
        text: "Double Click to edit",
        fontSize: 30,
        draggable: true,
      });

      textList.value.push(newText);
      // attribute to allow User to change innerText on double Click
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
      // add new Text to Layer 3
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
        xSize = width.value,
        ySize = height.value,
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
      var vertical: any = [0, width.value / 2, width.value];
      var horizontal: any = [0, height.value / 2, height.value];

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

    var guideLines = new Group();
    function drawGuides(guides: any) {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
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

      //stage.add(guideLines);
      if (stage.children) {
        stage.children[3].add(guideLines);
      }
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
      setTimeout(() => {
        guideLines.find(".guid-line").forEach((l) => l.destroy());
      }, 500);

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

    //---- update Styles
    
    //helper Vars to check if the Drawer on the right is active
    let drawerIsActive = ref<boolean>(false);
    let editCompIsActive = ref<boolean>(false);
    let activeComponent = ref<Rect | Text | null>(null);

    //closing the Edit Mode, if no Component is active
    watch(
      () => activeComponent.value,
      () => {
        if (activeComponent.value !== null) {
          editCompIsActive.value = false;
        }
      }
    );

    //Function to change the Backgroundcolor of an Component
    let activeCompBgColor = ref<string>("hello");
    //watches if activeCompBgColor changes, in input
    watch(
      () => activeCompBgColor.value,
      (newValue) => {
        if (activeComponent.value !== null) {
          const transformerNode = transformer.value.getNode();
          const stage = transformerNode.getStage() as Stage;
          //find the correct Component in the helperLists to change + Rect or Text
          let id = activeComponent.value.attrs.id;
          let shape = rectList.value.find((r) => r.attrs.id === id);          
          if (shape && !(shape instanceof Layer)) {
            shape.attrs.fill = newValue;
            //send the correct new shape to the setActiveAttributes function
            setActiveAttributes(shape as Rect);
          } else {
            const shape = textList.value.find((r) => r.attrs.id === id);
            if (shape && !(shape instanceof Layer)) {
              shape.attrs.fill = newValue;
              //send the correct new shape to the setActiveAttributes function
              setActiveAttributes(shape as Text);
            }
          }
          //update the stage
          if (stage.children) {
            stage.add(new Layer());
            stage.children.pop();
          }
        }
      }
    );

    //-------same as above for the other editable variables

    //for Rect only
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
          if (stage.children) {
            stage.add(new Layer());
            stage.children.pop();
          }
        }
      }
    );
    //for Rect only
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
          if (stage.children) {
            stage.add(new Layer());
            stage.children.pop();
          }
        }
      }
    );
    //for Rect only
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
          if (stage.children) {
            stage.add(new Layer());
            stage.children.pop();
          }
        }
      }
    );

    //for Text only
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
          if (stage.children) {
            stage.add(new Layer());
            stage.children.pop();
          }
        }
      }
    );

    //helper Function to change the attributes of the current active Component
    //gets the correct new shape and sets the activeComp.attrs
    const setActiveAttributes = (activeComp: Rect | Text) => {      
      activeCompBgColor.value = activeComp.attrs.fill;
      activeCornerRadius.value = activeComp.attrs.cornerRadius;
      activeStroke.value = activeComp.attrs.stroke;
      activeStrokeWidth.value = activeComp.attrs.strokeWidth;
      activeFontSize.value = activeComp.attrs.fontSize;
    };

    //function to delete a Component
    const deleteComp = () => {
      const transformerNode = transformer.value.getNode();
      const stage = transformerNode.getStage() as Stage;
      if (stage.children && stage.children[2].children) {
        stage.children[2].children.forEach((component, idx) => {
          if (activeComponent.value !== null) {
            if (
              component.attrs.id === activeComponent.value.attrs.id &&
              stage.children &&
              stage.children[2].children
            ) {
              //search for the same id of activeComp (to be deleted) and Child of Layer[2]
              stage.children[2].children?.splice(idx, 1);
            }
          }
        });
      }
      //update the stage
      if (stage.children) {
        stage.add(new Layer());
        stage.children.pop();
      }
      //update activeComponent & transformer nodes
      activeComponent.value = null;
      transformer.value.getNode().nodes([]);
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
      deleteComp,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>





.canvas__component {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 50px 0 25px 0;
}
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

/* .menu-wrapper
–––––––––––––––––––––––––––––––––––––––––––––––––– */
.top-nav .menu-wrapper {
  position: fixed;
  top: 103px;
  right: 0;
  height: 250px;
  width: 200px;
  transform: translateX(200px);
  transition: transform 0.7s;
  background: #21333c;
  border-radius: 4px;
  box-shadow: 2px 2px 10px rgb(100, 100, 100);
}

.top-nav .menu-wrapper.is-opened {
  transform: translateX(20px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.top-nav .menu-wrapper.is-opened.is-editBtn {
  height: 320px;
}
.top-nav .menu-wrapper.is-opened.is-editBtn.is-edit {
  height: 560px;
}

.top-nav .menu-wrapper .menu {
  opacity: 0;
  transition: opacity 0.4s;
}

.top-nav .menu-wrapper.is-opened .menu {
  opacity: 1;
  transition-delay: 0.6s;
}

.top-nav .menu-wrapper .menu a {
  font-size: 1.2rem;
}

.top-nav .menu-wrapper .sub-menu {
  padding: 10px 0 0 7px;
}

.top-nav .menu-wrapper .menu-close {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.6rem;
}

#container {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
}

#component-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  width: 90px;
  height: 90px;
  margin: 25px;
  padding: 6px 10px;
  font-family: "Roboto_Regular";
  font-size: 16px;
  font-weight: 500;
  border-radius: 3px;
  background-color: #80ba24;
  color: white;
  text-decoration: none;
  cursor: pointer;
  border: 2px solid #80ba24;
}

#component-btn span {
  font-size: 32px;
}

#component-btn:hover {
  background-color: #6ca512;
  border: 2px solid #80ba24;
}

.edit-component-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 150px;
  height: 40px;
  margin: 10px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 3px;
  background-color: transparent;
  border: 2px solid #80ba24;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgb(100, 100, 100);
}

.edit-component-btn span {
  font-size: 24px;
}

.edit-component-btn:hover {
  background-color: #80ba243f;
}

.edit-comp_div {
  font-size: 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 11px;
}

.edit-comp_div {
  width: 143px;
}

.edit-comp__sections {
  width: 143px;
  margin-bottom: 10px;
}

#delete-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  width: 50px;
  height: 40px;
  margin-left: 50px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 3px;
  background-color: transparent;
  border: 2px solid #80ba24;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  box-shadow: 2px 2px 10px rgb(100, 100, 100);
}

#delete-btn span {
  font-size: 24px;
}

#delete-btn:hover {
  background-color: #80ba243f;
}

.sections__input {
  width: 141px;
}
.sections__input:focus-visible {
  border: 0;
}

/* .fixed menu
–––––––––––––––––––––––––––––––––––––––––––––––––– */

.top-nav .fixed-menu {
  position: fixed;
  top: 103px;
  right: 0;
  height: 250px;
  display: flex;
  flex-direction: column;
  width: 50px;
  background: #21333c;
  align-items: center;
}

.top-nav .fixed-menu .menu-open {
  font-size: 1.8rem;
  font-size: 1.25em;
  font-weight: 500;
  width: 35px;
  height: 40px;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  background-color: transparent;
  transition: background 0.4s ease, color 0.4s ease;
  box-shadow: 2px 2px 10px rgb(100, 100, 100);
  border: 2px solid #80ba24;
  text-align: center;
  margin-top: 75px;
}

.top-nav .fixed-menu .menu-open:hover {
  color: #fff;
  background-color: #80ba243f;
  border: 2px solid #80ba24;
}

img {
  margin-top: 10px;
}

/* comparison__container
–––––––––––––––––––––––––––––––––––––––––––––––––– */
#comparison__container {
  color: white;
}

.wrap {
  max-width: 1300px;
}
@media screen and (max-width:1920px) {
  .wrap {
      max-width: 1000px;
    }
}
@media screen and (max-width:1440px) {
  .wrap {
    max-width: 900px;
  }
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

.wrap button {
  font-size: 1.25em;
  font-weight: 500;
  padding: 0.5em 1em;
  color: #21333c;
  border-radius: 0.25em;
  cursor: pointer;
  transition: background 0.4s ease, color 0.4s ease;
  box-shadow: 2px 2px 10px rgb(100, 100, 100);
  border: 2px solid #80ba24;
}
.wrap button:hover {
  color: #21333c;
  background-color: #80ba243f;
  border: 2px solid #80ba24;
}

#container__images {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
