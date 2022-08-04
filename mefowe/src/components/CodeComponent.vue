<template>
  <div class="code">
    <div v-if="loading" class="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div v-if="!loading">
      <div>
        <pre><code>{{body}}</code></pre>
      </div>
      <div>
        <pre><code>{{stylePart}}</code></pre>
      </div>
    </div>
    <iframe v-if="renderIFrame" id="theFrame" src="about:blank" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { generateTemplate } from "@/openAi/openAi";
import html2canvas from "html2canvas";
import store from "@/store";
import cssbeautify from "cssbeautify";

export default defineComponent({
  name: "Code",
  props: {
    chosenLayout: {
      type: String,
      required: true,
    },
  },
  emits: {
    // -> pass created Image of Code to Quiz-Parentn for comparison
    createdImage(image: string): boolean {
      return typeof image === "string";
    },
  },
  setup(props, context) {
    const template = ref<string>("abc");
    const loading = ref<boolean>(false);

    onMounted(async () => {
      loading.value = true;
      // -> generate a layout based on the chosen option from the difficulty level
      await generateTemplate(props.chosenLayout).then((result) => {
        template.value = result;
        loading.value = false;
      });
    });

    const body = ref<string>("");
    const stylePart = ref<string>("");

    const renderIFrame = ref<boolean>(true);

    watch(
      () => template.value,
      (newValue) => {
        if (template.value.length > 0) {
          // get the iFrame for image insert
          let frame = document.getElementById("theFrame");
          // create a new html document
          let doc = document.implementation.createHTMLDocument("New Document");
          // regExp to cut the blanks and so on
          const strippedString = newValue.replace(/[\r\n]/gm, "");

          const abc = /<body>(.*?)<\/body>/gm;

          // filter for the body of the document
          let found = abc.exec(strippedString);

          if (found) {
            // insert the body into the new document
            doc.body.insertAdjacentHTML("beforeend", found[1]);

            // reformat body to valid html structure
            body.value = process(found[1]);

            // regexp to cut lineBreaks
            const withoutLineBreaks = newValue.replace(/[\r\n]/gm, "");

            let cssRegexp = /[^<>]+/gm;
            cssRegexp = /<style>(.*?)<\/style>/gm;

            // filter for the style tag
            let matchStyle = withoutLineBreaks.match(cssRegexp);

            // if found style without declarations, go on
            if (matchStyle) {
              let matching = cssRegexp.exec(matchStyle[0]);

              if (matching) {
                let head = doc.head || doc.getElementsByTagName("head")[0];
                let style = doc.createElement("style");

                head.appendChild(style);

                style.type = "text/css";

                style.appendChild(doc.createTextNode(matching[1]));
                stylePart.value = cssbeautify(matching[1]);

                if (frame && frame instanceof HTMLIFrameElement) {
                  // Copy the new HTML document into the frame
                  let destDocument = frame.contentDocument;
                  let srcNode = doc.documentElement;

                  if (destDocument) {
                    let newNode = destDocument.importNode(srcNode, true);

                    destDocument.replaceChild(
                      newNode,
                      destDocument.documentElement
                    );

                    const screenshotTarget = destDocument.body;

                    html2canvas(screenshotTarget).then((canvas) => {
                      const base64image = canvas.toDataURL("image/png");
                      context.emit("createdImage", base64image);
                      setTimeout(() => {
                        renderIFrame.value = false;
                      }, 2000);
                    });
                  }
                }
              }
            } else {
              cssRegexp = /<style\s.*?>(.*?)<\/style>/gm;

              // filter for style tag with further declarations
              let matchStyle = withoutLineBreaks.match(cssRegexp);

              // if found style with declarations, go on
              if (matchStyle) {
                let matching = cssRegexp.exec(matchStyle[0]);

                if (matching) {
                  // create style tag in document-head
                  let head = doc.head || doc.getElementsByTagName("head")[0];
                  let style = doc.createElement("style");

                  head.appendChild(style);

                  // declare the style type
                  style.type = "text/css";

                  // insert the found css into the new style tag
                  style.appendChild(doc.createTextNode(matching[1]));

                  // readjust the formatting for display in code-editor
                  stylePart.value = cssbeautify(matching[1]);

                  if (frame && frame instanceof HTMLIFrameElement) {
                    // Copy the new HTML document into the frame
                    let destDocument = frame.contentDocument;
                    let srcNode = doc.documentElement;

                    if (destDocument) {
                      let newNode = destDocument.importNode(srcNode, true);

                      destDocument.replaceChild(
                        newNode,
                        destDocument.documentElement
                      );
                      const screenshotTarget = destDocument.body;

                      // make Screeshot of the canvas aka iFrame
                      html2canvas(screenshotTarget).then((canvas) => {
                        const base64image = canvas.toDataURL("image/png");
                        context.emit("createdImage", base64image);
                        setTimeout(() => {
                          renderIFrame.value = false;
                        }, 2000);
                      });
                    }
                  }
                }
              } else {
                // if no style was found, continue without it
                if (frame && frame instanceof HTMLIFrameElement) {
                  // Copy the new HTML document into the frame
                  let destDocument = frame.contentDocument;
                  let srcNode = doc.documentElement;

                  if (destDocument) {
                    let newNode = destDocument.importNode(srcNode, true);

                    destDocument.replaceChild(
                      newNode,
                      destDocument.documentElement
                    );
                    const screenshotTarget = destDocument.body;

                    // make Screeshot of the canvas aka iFrame
                    html2canvas(screenshotTarget).then((canvas) => {
                      const base64image = canvas.toDataURL("image/png");
                      context.emit("createdImage", base64image);
                      setTimeout(() => {
                        renderIFrame.value = false;
                      }, 2000);
                    });
                  }
                }
              }
            }
          }
        }
      }
    );

    watch(
      () => store.state.chosenOption,
      async (newValue) => {
        loading.value = true;
        renderIFrame.value = true;
        // -> generate a layout based on the chosen option from the difficulty level
        await generateTemplate(newValue).then((result) => {
          template.value = result;
          loading.value = false;
        });
      }
    );

    function process(str: string) {
      // -> beautify html-markup
      var div = document.createElement("div");
      div.innerHTML = str.trim();

      return format(div, 0).innerHTML;
    }

    function format(node: Element, level: number) {
      var indentBefore = new Array(level++ + 1).join("  "),
        indentAfter = new Array(level - 1).join("  "),
        textNode;

      for (var i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode("\n" + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        format(node.children[i], level);

        if (node.lastElementChild == node.children[i]) {
          textNode = document.createTextNode("\n" + indentAfter);
          node.appendChild(textNode);
        }
      }

      return node;
    }

    return {
      template,
      loading,
      body,
      stylePart,
      renderIFrame,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.code {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 80%;
  margin: 20px;
  background-color: #21333c;
  color: white;
  border-radius: 0.5em;
  padding: 5px;
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

#theFrame {
  opacity: 0;
  width: 1300px;
  height: 1000px;
  z-index: -10;
}

.lds-ring {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 8px solid #fff;
  border-radius: 50%;
  animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: #fff transparent transparent transparent;
}
.lds-ring div:nth-child(1) {
  animation-delay: -0.45s;
}
.lds-ring div:nth-child(2) {
  animation-delay: -0.3s;
}
.lds-ring div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

pre {
  white-space: pre-wrap;
}
</style>
