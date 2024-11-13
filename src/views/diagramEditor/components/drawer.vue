<template>
  <div class="Ec-x6-icon">
    <el-drawer
      title="组件栏"
      :visible.sync="visible"
      :direction="direction"
      size="300px"
      :modal="false"
      :modal-append-to-body="false"
      style="position: absolute; width: 300px; box-sizing: border-box"
      show-close
    >
      <div class="scroll-container">
        <section class="listBar" @click.stop="">
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
            <el-divider></el-divider>
          </div>
        </section>
      </div>
    </el-drawer>
  </div>
</template>

<script>
// const mouseXY = { x: null, y: null };
// import config from "./config";
// import api from "@/api";

import api from "@/api.js";

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
    this.fetchComponentList();
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
    fetchComponentList() {
      api
        .queryComponentList()
        .then((response) => {
          if (response.data.status === 200) {
            // 假设组件列表数据在 response.data.data 中
            this.configList = response.data.data;
            console.log(this.configList);
            this.categorizeComponents();
          } else {
            console.error("获取组件列表失败：", response.data.message);
          }
        })
        .catch((error) => {
          console.error("请求错误：", error);
        });
    },
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
/* 组件栏的总体样式 */
.Ec-x6-icon .el-drawer__header {
  padding: 0 12px;
  margin-bottom: 0;
}

/* 滚动容器样式 */
.scroll-container {
  height: 80vh; /* 设置滚动区域的固定高度 */
  overflow-y: auto; /* 使内容超出时出现滚动条 */
  padding-right: 10px; /* 为滚动条留出空间 */
}

/* 每个类别的样式，保证不同类别的分隔 */
.category-section {
  margin-bottom: 20px; /* 设置类别之间的垂直间距 */
}

/* 类别标题样式 */
.category-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  margin-bottom: 10px;
}

/* 调整箭头大小 */
.category-header img {
  margin-right: 6px;
  width: 12px; /* 设置箭头宽度 */
  height: 12px; /* 设置箭头高度 */
  transition: transform 0.3s;
}

/* 展开/收起箭头样式 */
.category-header img {
  margin-right: 6px;
  transition: transform 0.3s;
}

/* 控制箭头旋转 */
.arrow {
  transform: rotate(90deg);
}

.arrow:not(.arrow) {
  transform: rotate(0deg);
}

/* 组件网格布局 */
.component-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(60px, 1fr)
  ); /* 一行可显示多个组件 */
  gap: 10px;
  justify-items: center;
  padding: 10px 0;
}

/* 单个组件项的样式 */
.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

/* 组件图标样式 */
.component-icon {
  width: 40px;
  height: 40px;
}

/* 组件标签文字样式 */
.component-label {
  margin-top: 5px;
  font-size: 12px;
  color: #939393;
  text-align: center;
}

/* 自定义滚动条样式 */
.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
