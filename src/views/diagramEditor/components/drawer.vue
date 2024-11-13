<template>
  <div class="fixed-sidebar">
    <div class="scroll-container">
      <section class="listBar">
        <div
          v-for="(components, category) in categorizedComponents"
          :key="category"
          class="category-section"
        >
          <p class="category-header" @click="toggleCategory(category)">
            <img
              :class="{ arrow: isCategoryOpen(category) }"
              src="@/assets/svg/arrow.svg"
              alt=""
            />
            {{ category }}
          </p>
          <div v-if="isCategoryOpen(category)" class="component-grid">
            <div
              v-for="(item, index) in components"
              :key="index"
              class="component-item"
              draggable="true"
              @drag="drag(item)"
              @dragend="dragend(item, $event)"
            >
              <img
                :src="item.icon || '@/assets/svg/defaultImg.svg'"
                alt=""
                class="component-icon"
              />
              <p class="component-label">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
// const mouseXY = { x: null, y: null };
// import config from "./config";
// import api from "@/api";

// import api from "@/api.js";

export default {
  name: "DrawerCom",
  // props: {
  //   drawCot: {
  //     type: Object,
  //     required: true,
  //   },
  // },
  data() {
    return {
      visible: true, // 控制抽屉是否可见
      direction: "ltr", // 抽屉的滑动方向
      showMore: false, // 控制是否显示组件列表
      configList: [
        {
          label: "光伏",
          type: "光伏组件",
          icon: "https://i.imgur.com/or1EZsz.jpg",
        },
        {
          label: "生成器",
          type: "光伏组件",
          icon: "https://i.imgur.com/4xBTxfw.jpg",
        },
        {
          label: "控制器",
          type: "控制组件",
          icon: "https://i.imgur.com/hddYTc6.jpg",
        },
      ],
      categorizedComponents: {}, // 分类后的组件列表
      categoryState: {},
    };
  },
  created() {
    // this.fetchComponentList();
    this.categorizeComponents(this.configList);
    this.initializeCategoryState();
  },
  methods: {
    drag: function () {
      // const parentRect = document
      //   .getElementById("container")
      //   .getBoundingClientRect();
      // let mouseInGrid = false;
      // if (
      //   mouseXY.x > parentRect.left &&
      //   mouseXY.x < parentRect.right &&
      //   mouseXY.y > parentRect.top &&
      //   mouseXY.y < parentRect.bottom
      // ) {
      //   mouseInGrid = true;
      // }
    },

    dragend(item, event) {
      // Emit 绝对坐标
      const { x, y } = { x: event.clientX, y: event.clientY };
      this.$emit("addNode", { icon: item.icon, label: item.label, x, y });
    },
    // fetchComponentList() {
    //   api
    //     .queryComponentList()
    //     .then((response) => {
    //       if (response.data.status === 200) {
    //         // 假设组件列表数据在 response.data.data 中
    //         this.configList = response.data.data;
    //         console.log(this.configList);
    //         this.categorizeComponents();
    //       } else {
    //         console.error("获取组件列表失败：", response.data.message);
    //       }
    //     })
    //     .catch((error) => {
    //       console.error("请求错误：", error);
    //     });
    // },
    categorizeComponents(components) {
      const categorized = {};
      components.forEach((component) => {
        const type = component.type || "未分类";
        if (!categorized[type]) {
          categorized[type] = [];
        }
        categorized[type].push(component);
      });
      this.categorizedComponents = categorized;
    },
    initializeCategoryState() {
      // 将每个类别的状态设置为 true（展开）
      Object.keys(this.categorizedComponents).forEach((category) => {
        this.$set(this.categoryState, category, true);
      });
    },
    toggleCategory(category) {
      this.$set(this.categoryState, category, !this.categoryState[category]);
    },
    isCategoryOpen(category) {
      return this.categoryState[category];
    },
  },
};
</script>
<style lang="less" scoped>
.fixed-sidebar {
  width: 100%;
  height: 100vh;
  background-color: #f7f7f7;
  border-right: 0.2px solid #ddd;
  padding: 10px;
  box-sizing: border-box;
}

.scroll-container {
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.category-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  margin-bottom: 10px;
}

.category-header img {
  margin-right: 6px;
  width: 12px;
  height: 12px;
  transition: transform 0.3s;
}

.arrow {
  transform: rotate(90deg);
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
  justify-items: center;
  padding: 10px 0;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.component-icon {
  width: 40px;
  height: 40px;
}

.component-label {
  margin-top: 5px;
  font-size: 12px;
  color: #939393;
  text-align: center;
}
</style>
