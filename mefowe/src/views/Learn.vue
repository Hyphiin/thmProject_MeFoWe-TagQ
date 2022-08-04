<template>
  <div class="learn">
    <h1>Lerne mehr zu HTML und CSS!</h1>

    <div class="wrapper">
      <div class="container">
        <div class="card">
          <div class="headerhtml"> <h2>HTML</h2></div>
          <div v-for="(item, index) in descriptionHTML" :key="index">
            <div class="portion">
              <div class="name">{{ item.name }}</div>
              <div class="markup" v-if="item.tag == ''">
                &lt;<span class="red">{{ item.name }}</span
                >> &lt;/<span class="red">{{ item.name }}</span
                >>
              </div>
              <div class="markup" v-else>{{ item.tag }}</div>
              <div class="elementText">{{ item.text }}</div>
            </div>
          </div>
        </div>
        <div class="spacer"></div>
        <div class="card">
          <div class="headerhtml"><h2>CSS</h2></div>
          <div v-for="(item, index) in descriptionCSS" :key="index">
            <div class="portion">
              <div class="name">{{ item.name }}</div>
              <div class="markup">{{ item.style }}</div>
              <div class="elementText">{{ item.text }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "Learn",
  components: {},
  setup() {
    const descriptionHTML = ref([
      { type: "HTMl", name: "a", tag: "<a href='link'>Text</a>", text: "Definiert einen Hyperlink" },
      {
        type: "HTMl",
        name: "body",
        tag: "",
        text: "Gibt es nur einmal pro Dokument. Es repräsentiert den Inhalt des HTML Dokuments",
      },
      {
        type: "HTMl",
        name: "button",
        tag: "",
        text: "Ein interaktives Element, welches von dem User benutzt werden kann ",
      },
      {
        type: "HTMl",
        name: "canvas",
        tag: "",
        text: "Ermöglicht die dynamische Darstellung grafischer Informationen",
      },
      {
        type: "HTMl",
        name: "div",
        tag: "",
        text: "Ein allgemeiner Container, welcher keine semantische Bedeutung besitzt",
      },
      {
        type: "HTMl",
        name: "em",
        tag: "",
        text: "Stellt das umschlossene Wort kursiv da",
      },
      {
        type: "HTMl",
        name: "figure",
        tag: "",
        text: "Behinhaltet in sich geschlossenen Inhalt, welcher häufig ein Bild und eine Bildunterschrift ist",
      },
      {
        type: "HTMl",
        name: "footer",
        tag: "",
        text: "Ist die Fußzeile und beinhaltet z.B. Autor, Copyright Daten oder Links (Footer-Navigation)",
      },
      {
        type: "HTMl",
        name: "form",
        tag: "",
        text: "Dokument Bereich der interaktive Felder hat um Informationen zu senden",
      },
      {
        type: "HTMl",
        name: "h1-h6",
        tag: "",
        text: "Überschriftenelement mit unterschiedlichen Leveln",
      },
      {
        type: "HTMl",
        name: "head",
        tag: "",
        text: "Legt den Kopf des Dokuments fest. Informationen und Meta-Daten werden dort angegeben",
      },
      {
        type: "HTMl",
        name: "header",
        tag: "",
        text: "Navigationshilfe, kann aber auch Logo und Suchfeld beinhalten",
      },
      {
        type: "HTMl",
        name: "i",
        tag: "",
        text: "Stellt das umschlossene Wort kursiv da",
      },
      {
        type: "HTMl",
        name: "img",
        tag: "",
        text: "Fügt eine Grafik in das Dokument ein",
      },
      {
        type: "HTMl",
        name: "input",
        tag: "",
        text: "Interaktives Bedienelemente für Formulare",
      },
      {
        type: "HTMl",
        name: "label",
        tag: "",
        text: "Beinhaltet Textbeschreibung für z.B. input ",
      },
      {
        type: "HTMl",
        name: "li",
        tag: "",
        text: "Listen Element innerhalb einer Liste/Menü",
      },
      {
        type: "HTMl",
        name: "menu",
        tag: "",
        text: "Beinhaltet eine ungeordnete Liste mit li elementen, semantisch gleich mit ul",
      },
      {
        type: "HTMl",
        name: "nav",
        tag: "",
        text: "Zeichnet den Seitenbereich aus, der Navigationslinks bereitstellt",
      },
      {
        type: "HTMl",
        name: "ol",
        tag: "<ol>\n  <li></li>\n  <li></li>\n</ol>",
        text: "Definiert eine geordnete Liste, Zahlen und Buchstaben sind möglich, auch verschachtlung",
      },
      {
        type: "HTMl",
        name: "p",
        tag: "",
        text: "Gruppiert zusammenhängenden Inhalt, z.B. Bilder, Formularfelder oder Textabsätze",
      },
      {
        type: "HTMl",
        name: "script",
        tag: "",
        text: "Das Element wird häufig verwendet um JavaScript einzubinden",
      },
      {
        type: "HTMl",
        name: "section",
        tag: "",
        text: "Hilft bei der allgemeinen Unterteilung des Dokuments. Beinhaltet am besten ein H1-H6-Element, ist aber kein allgemeines Containerelement",
      },
      {
        type: "HTMl",
        name: "span",
        tag: "",
        text: "Inline Element, welches vor allem für Styling verwendet wird",
      },
      {
        type: "HTMl",
        name: "strong",
        tag: "",
        text: "Sorgt für den Fettdruck des umschlossenen Inhalts",
      },
      {
        type: "HTMl",
        name: "table",
        tag: "",
        text: "Für Daten darstellung in zwei oder mehr Dimensionen",
      },
      {
        type: "HTMl",
        name: "tbody",
        tag: "",
        text: "Ist der Tabellenkörper mit Inhalten",
      },
      {
        type: "HTMl",
        name: "td",
        tag: "",
        text: "Definiert eine Zeile in der Tabelle",
      },
      {
        type: "HTMl",
        name: "th",
        tag: "",
        text: "Definiert eine Zelle als Überschrift für Spalten/Zeilen, über den Scope definierbar",
      },
      {
        type: "HTMl",
        name: "thead",
        tag: "",
        text: "Beinhaltet die Kopfzeile einer Tabelle und somit die Spaltenbeschreibung",
      },
      {
        type: "HTMl",
        name: "title",
        tag: "",
        text: "Definiert den Titel des Dokumentes und wird in der Titelleiste des Browsers oder der Registerkarte angezeigt. Ist Metadata und somit im <head>",
      },
      {
        type: "HTMl",
        name: "tr",
        tag: "",
        text: "Definiert eine Tabellenreihe",
      },
      {
        type: "HTMl",
        name: "ul",
        tag: "<ul>\n  <li></li>\n  <li></li>\n</ul>",
        text: "Beinhaltet eine ungeordnete Liste mit li Elementen",
      },
      {
        type: "HTMl",
        name: "video",
        tag: "",
        text: "Bettet Videos ein, mehrere Quellen per src defenierbar",
      },
    ]);

    const descriptionCSS = ref([
      {
        type: "CSS",
        name: "color",
        style: "",
        text: "Die Farbe des Elements wird dort angegeben",
      },
      {
        type: "CSS",
        name: "background-color",
        style: "",
        text: "Die Hintergrundfarbe des Elements ",
      },
      {
        type: "CSS",
        name: "background-image",
        style: "",
        text: "Setzt ein Bild als Hintergrund",
      },
      {
        type: "CSS",
        name: "display",
        style: "block, flex, inline-block, inline, none",
        text: "Legt das Verhalten des Inhalts fest, block, inline, flex, none",
      },
      {
        type: "CSS",
        name: "width",
        style: "px, em, %, vw",
        text: "Die Breite des Elements",
      },
      { type: "CSS", name: "height", style: "px, em, %, vh", text: "Die Höhe des Elements" },
      {
        type: "CSS",
        name: "min-width",
        style: "px, em, %, vw",
        text: "die minimale breite des Elements, die nicht unterschritten wird",
      },
      {
        type: "CSS",
        name: "min-height",
        style: "px, em, %, vh",
        text: "die minimale höhe des Elements, die nicht unterschritten wird",
      },
      {
        type: "CSS",
        name: "max-width",
        style: "px, em, %, vw",
        text: "die maximale breite des Elements, die nicht überschritten wird",
      },
      {
        type: "CSS",
        name: "max-height",
        style: "px, em, %, vw",
        text: "die maximale höhe des Elements, die nicht überschritten wird",
      },
      {
        type: "CSS",
        name: "margin",
        style: "px, em, %",
        text: "Abstand zwischen border und anderen Elementen",
      },
      {
        type: "CSS",
        name: "padding",
        style: "",
        text: "Abstand zwischen border und Inhalt",
      },
      { type: "CSS", name: "border", style: "", text: "Border-Eigenschaften" },
      {
        type: "CSS",
        name: "border-width",
        style: "",
        text: "Die Breite der Border",
      },
      {
        type: "CSS",
        name: "border-style",
        style: "none, solid, dotted, inset, dashed solid...",
        text: "Das Styling der Border: nichts, fest...",
      },
      {
        type: "CSS",
        name: "border-radius",
        style: "",
        text: "Die Rundung der Border-Ecken",
      },
      {
        type: "CSS",
        name: "font",
        style: "",
        text: "Eigenschaften der Schriftart",
      },
      {
        type: "CSS",
        name: "font-family",
        style: "",
        text: "Definiert die Schriftart/familie",
      },
      {
        type: "CSS",
        name: "font-style",
        style: "normal, italic, oblique",
        text: "Gibt an ob es normal oder z.B. italic ist",
      },
      {
        type: "CSS",
        name: "font-weight",
        style: "normal, bold, lighter, bolder",
        text: "Gibt die dicke der Schrift an",
      },
      {
        type: "CSS",
        name: "position",
        style: "static, relative, absolute, fixed, sticky",
        text: "Gibt die Position des Elements an, static, relative, absolute, fixed...",
      },
      {
        type: "CSS",
        name: "z-index",
        style: "",
        text: "Gibt die Höhe der Elemente an, welchen zwei Elemente sich überlappen",
      },
    ]);

    return {
      descriptionHTML,
      descriptionCSS,
    };
  },
});
</script>

<style scoped>
.learn {
  color: white;
}

.wrapper {
  display: flex;
  justify-content: center;
}

.container {
  width: 1000px;
  position: relative;
  justify-content: space-between;
  margin-bottom: 350px;
}

.container .card {
  position: relative;
  background: #21333c;
  justify-content: center;
  align-items: center;
}

.container .headerhtml {
  height: 100px;
  background-image: Url('../../public/img/html_header.jpg');
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.container .spacer {
  height: 100px;
}
.container .card .portion {
  display: flex;
  min-height: 100px;
  align-items: center;
}

.container .card .portion .name {
  width: 200px;
}

.container .card .portion .markup {
  width: 200px;
  white-space: pre-wrap;
  text-align: start;
}

.container .card .portion .elementText {
  flex-basis: 500px;
  flex-grow: 0;
  text-align: start;
}

.red {
  color: red;
}
</style>
