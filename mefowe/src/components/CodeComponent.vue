<template>
  <div class="code">
    <pre><code>{{template}}</code></pre>
    <editor-content :editor="editor" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useEditor, EditorContent, generateHTML } from "@tiptap/vue-3/src";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Code from "@tiptap/extension-code";
import Bold from "@tiptap/extension-bold";
import { generateTemplate } from "@/openAi/openAi";

export default defineComponent({
  name: "Code",
  components: {
    EditorContent,
  },
  props: {
    msg: String,
  },
  setup() {
    const json = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Example ",
            },
            {
              type: "text",
              marks: [
                {
                  type: "bold",
                },
              ],
              text: "Text",
            },
          ],
        },
      ],
    };

    const output = generateHTML(json, [
      Document,
      Paragraph,
      Text,
      Bold,
      // other extensions …
    ]);

    const edit = `
    <h2>
      Hi there,
    </h2>
    <p>
      this is a basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
    </p>
    <ul>
      <li>
        That’s a bullet list with one …
      </li>
      <li>
        … or two list items.
      </li>
    </ul>
    <p>
      Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    </p>
    <p>
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
    </p>
    <blockquote>
      Wow, that’s amazing. Good work, boy! 👏
      <br />
      — Mom
    </blockquote>
  `;

    var newedit = edit.replace(/</g, "&lt;");
    var newnewedit = newedit.replace(/>/g, "&gt;");

    var content = `<pre><code>${newnewedit}</code></pre>
     <pre><code class="language-css">
     body {
  display: none;
  }
  </code></pre>`;

    let abc = "&ltp&gt; Hello &ltp/&gt;";

    const editor = useEditor({
      content: content,
      extensions: [Document, Paragraph, Text, Code],
    });

    const template = ref<string>("");

    onMounted(async () => {
      template.value = await generateTemplate(
        "write a html layout for a ice cream shop"
      );
    });

    return {
      editor,
      newnewedit,
      output,
      template,
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
</style>
