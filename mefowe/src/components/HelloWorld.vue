<template>
  <div class="hello">
    <editor-content :editor="editor" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { StarterKit } from "@tiptap/starter-kit/src/starter-kit";
import { useEditor, EditorContent } from "@tiptap/vue-3/src";

export default defineComponent({
  name: "Task",
  components: {
    EditorContent,
  },
  props: {
    msg: String,
  },
  setup() {
    const editor = useEditor({
      content:
        "<p>A Vue.js wrapper component for tiptap to use <code>v-model</code>.</p>",
      extensions: [StarterKit],
    });

    return { editor };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
