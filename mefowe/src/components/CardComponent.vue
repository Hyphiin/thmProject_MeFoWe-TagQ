<template>
  <div class="container">
    <div class="card">
      <div class="face face1">
        <div class="content">
          <span class="material-symbols-outlined"> child_care </span>
          <h3>Level 1</h3>
        </div>
      </div>
      <div class="face face2">
        <div class="content">
          <p>
            Beginne mit den Grundlagen der Webentwicklung und lerne einfaches
            HTML und CSS an simplen und einfach verständlichen Templates.
          </p>
          <router-link :to="{ name: 'Quiz' }" @click="chooseOption('level1')">
            <button>Start</button>
          </router-link>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="face face1">
        <div class="content">
          <span class="material-symbols-outlined"> terminal </span>
          <h3>Level 2</h3>
        </div>
      </div>
      <div class="face face2">
        <div class="content">
          <p>
            In diesem Level erwarten dich etwas komplexere Layouts, die durchaus
            über simple Layouts hinausgehen und mehrfach verschachtelt sein
            können.
          </p>
          <router-link :to="{ name: 'Quiz' }" @click="chooseOption('level2')">
            <button>Start</button>
          </router-link>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="face face1">
        <div class="content">
          <span class="material-symbols-outlined"> rocket_launch </span>
          <h3>Level 3</h3>
        </div>
      </div>
      <div class="face face2">
        <div class="content">
          <p>
            Diese Level ist für erfahrene Entwickler gedacht, die bereits sehr
            sicher im Umgang mit HTML und CSS sind und ein breit gefächertes
            Verständnis haben.
          </p>
          <router-link :to="{ name: 'Quiz' }" @click="chooseOption('level3')">
            <button>Start</button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Card",
  components: {},
  emits: {
    chosenOption(level: string): boolean {
      return typeof level === "string";
    },
  },
  setup(_props, context) {
    const chooseOption = (level: string) => {
      context.emit("chosenOption", level);
    };

    return {
      chooseOption,
    };
  },
});
</script>

<style scoped>
.container {
  width: 1000px;
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 350px;
}

.container .card {
  position: relative;
  cursor: pointer;
}

.container .card .face {
  width: 300px;
  height: 200px;
  transition: 0.5s;
}

.container .card .face.face1 {
  position: relative;
  background: #21333c;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
  transform: translateY(100px);
}

.container .card:hover .face.face1 {
  background: #80ba24;
  transform: translateY(0);
}

.container .card .face.face1 .content {
  opacity: 0.2;
  transition: 0.5s;
}

.container .card:hover .face.face1 .content {
  opacity: 1;
}

.container .card .face.face1 .content img {
  max-width: 100px;
}

.container .card .face.face1 .content h3 {
  margin: 10px 0 0;
  padding: 0;
  color: #fff;
  text-align: center;
  font-size: 1.5em;
}

.container .card .face.face2 {
  position: relative;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  transform: translateY(-100px);
}

.container .card:hover .face.face2 {
  transform: translateY(0);
}

.container .card .face.face2 .content p {
  margin: 0;
  padding: 0;
  color: black;
}

.container .card .face.face2 .content button {
  margin: 15px 0 0;
  display: inline-block;
  text-decoration: none;
  font-weight: 900;
  color: #21333c;
  padding: 5px;
  border: 1px solid #21333c;
}

.container .card .face.face2 .content button:hover {
  background: #21333c;
  color: #fff;
}
</style>
