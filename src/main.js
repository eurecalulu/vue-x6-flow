import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import { EventBus } from "./eventBus";
Vue.prototype.$EventBus = EventBus;

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");

// 在项目的 main.js 中定义
Vue.directive("dialog-drag", {
  bind(el) {
    const dialogHeaderEl = el.querySelector(".el-dialog__header");
    const dragDom = el.querySelector(".el-dialog");

    dialogHeaderEl.style.cursor = "move";

    // 获取原有的样式
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null);

    dialogHeaderEl.onmousedown = (e) => {
      const disX = e.clientX - dialogHeaderEl.offsetLeft;
      const disY = e.clientY - dialogHeaderEl.offsetTop;

      const screenWidth = document.body.clientWidth; // body 当前宽度
      const screenHeight = document.body.clientHeight; // body 当前高度

      const dragDomWidth = dragDom.offsetWidth; // 对话框宽度
      const dragDomHeight = dragDom.offsetHeight; // 对话框高度

      const minDragDomLeft = dragDom.offsetLeft;
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

      const minDragDomTop = dragDom.offsetTop;
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomHeight;

      // 获取到的值带 px 正则匹配替换
      let styL, styT;

      if (sty.left.includes("%")) {
        styL = +document.body.clientWidth * (+sty.left.replace(/%/g, "") / 100);
        styT = +document.body.clientHeight * (+sty.top.replace(/%/g, "") / 100);
      } else {
        styL = parseFloat(sty.left.replace("px", ""));
        styT = parseFloat(sty.top.replace("px", ""));
      }

      document.onmousemove = function (e) {
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        // 边界处理
        if (-left > minDragDomLeft) {
          left = -minDragDomLeft;
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft;
        }

        if (-top > minDragDomTop) {
          top = -minDragDomTop;
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop;
        }

        // 移动当前元素
        dragDom.style.left = `${left + styL}px`;
        dragDom.style.top = `${top + styT}px`;
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
});
