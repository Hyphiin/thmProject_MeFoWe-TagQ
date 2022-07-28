<template>
  <div class="code">
    <div>
      <pre><code>{{body}}</code></pre>
    </div>
    <div>
      <pre><code>{{stylePart}}</code></pre>
    </div>
    <iframe id="theFrame" src="about:blank" />
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
    createdImage(image: string): boolean {
      return typeof image === "string";
    },
  },
  setup(props, context) {
    const template = ref<string>("Awaiting Template... BiBaBub");

    onMounted(async () => {
      template.value = await generateTemplate(props.chosenLayout);
    });

    const body = ref<string>("");
    const stylePart = ref<string>("");

    watch(
      () => template.value,
      (newValue) => {
        if (template.value.length > 0) {
          let frame = document.getElementById("theFrame");
          let doc = document.implementation.createHTMLDocument("New Document");

          const strippedString = newValue.replace(/[\r\n]/gm, "");

          const abc = /<body>(.*?)<\/body>/gm;

          let found = abc.exec(strippedString);
          if (found) {
            doc.body.insertAdjacentHTML("beforeend", found[1]);
            body.value = process(found[1]);
            const withoutLineBreaks = newValue.replace(/[\r\n]/gm, "");

            let cssRegexp = /[^<>]+/gm;
            cssRegexp = /<style>(.*?)<\/style>/gm;

            let matchStyle = withoutLineBreaks.match(cssRegexp);

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
                    });
                  }
                }
              }
            } else {
              cssRegexp = /<style\s.*?>(.*?)<\/style>/gm;

              let matchStyle = withoutLineBreaks.match(cssRegexp);

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
                      });
                    }
                  }
                }
              } else {
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
        template.value = await generateTemplate(newValue);
      }
    );

    function process(str: string) {
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
      body,
      stylePart,
    };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.code {
  height: 100%;
  margin: 20px;
  background-color: #21333c;
  color: white;
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
  /* display: none; */

  opacity: 0;
  width: 1800px;
  height: 1000px;
  z-index: -10;
}
</style>
