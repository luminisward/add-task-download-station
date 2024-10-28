import Settings from "./SettingsDialog.vue";
import { addUrl } from "./qts";

let clickedEl: EventTarget | null = null;
document.addEventListener("contextmenu", function (event) {
  clickedEl = event.target;
});
GM_registerMenuCommand("add task", async () => {
  if (clickedEl) {
    console.log(`the clicked element is :`);
    console.log(clickedEl);

    if (clickedEl instanceof HTMLElement) {
      let element = clickedEl as HTMLElement;
      while (
        element &&
        !(element instanceof HTMLAnchorElement) &&
        element.parentElement
      ) {
        element = element.parentElement;
      }

      if (element instanceof HTMLAnchorElement) {
        console.log(element.href);
        addUrl(element.href);
      } else {
        console.log("no link found");
      }
    } else {
      throw new Error("clickedEl is not a HTMLElement");
    }

    clickedEl = null;
  }
});

GM_registerMenuCommand("Settings", () => {
  createApp(Settings).mount(
    (() => {
      const app = document.createElement("div");
      document.body.append(app);
      return app;
    })(),
  );
});

const anchors = document.getElementsByTagName("a");
for (const a of Array.from(anchors)) {
  if (a.href.startsWith("magnet:")) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      addUrl(a.href)
        .then((res) => {
          console.log("addUrl Success: ", res);
        })
        .catch((err) => {
          throw err;
        });
    });
  }
}
