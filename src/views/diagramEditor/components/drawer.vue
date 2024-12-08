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
                :src="resolveIconUrl(item.icon)"
                alt=""
                class="component-icon"
              />
              <p class="component-label">{{ item.label }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    <type-dialog ref="typeDialog" />
  </div>
</template>

<script>
import api from "@/api"; // 导入 API 模块
import TypeDialog from "./typeDialog.vue";
export default {
  name: "DrawerCom",
  components: {
    TypeDialog,
  },
  props: {
    modelId: {
      type: String,
      required: true, // 指定 modelId 是必需的
    },
    diagramType: {
      type: String,
    },
  },
  data() {
    return {
      visible: true,
      direction: "ltr",
      showMore: false,
      // 配置组件列表，添加 AntV X6 的基础组件到第一个分类
      configList: [
        // 基础组件分类
        {
          label: "矩形",
          type: "基础组件",
          category: "基础组件",
          shape: "rect",
          icon: require("@/assets/svg/rect.svg"),
        },
        {
          label: "圆形",
          type: "基础组件",
          category: "基础组件",
          shape: "circle",
          icon: require("@/assets/svg/circle.svg"),
        },
        {
          label: "椭圆",
          type: "基础组件",
          category: "基础组件",
          shape: "ellipse",
          icon: require("@/assets/svg/ellipse.svg"),
        },
        {
          label: "总线（水平）",
          type: "基础组件",
          category: "基础组件",
          shape: "straight-line-horizontal",
          icon: require("@/assets/svg/straight-line.svg"),
        },
        {
          label: "总线（竖直）",
          type: "基础组件",
          category: "基础组件",
          shape: "straight-line-vertical",
          icon: require("@/assets/svg/straight-line.svg"),
        },
      ],
      categorizedComponents: {}, // 分类后的组件列表
      categoryState: {},
      iconCache: {},
    };
  },
  created() {
    this.fetchComponentList();
    // this.categorizeComponents(this.configList);
    // this.initializeCategoryState();
  },
  methods: {
    drag: function () {},

    dragend(item, event) {
      // Emit 绝对坐标
      const { x, y } = { x: event.clientX, y: event.clientY };
      if (
        item.type === "基础组件" &&
        !item.shape.includes("line") &&
        this.diagramType !== "controller"
      ) {
        this.$refs.typeDialog.openDialog().then((selectedCategory) => {
          this.$emit("addNode", {
            shape: item.shape,
            icon: item.icon,
            label: item.label,
            type: selectedCategory, // 这里传递用户选择的category
            x,
            y,
          });
        });
      } else {
        this.$emit("addNode", {
          shape: item.shape,
          icon: item.icon,
          label: item.label,
          type: item.type,
          x,
          y,
        });
      }
    },
    async fetchComponentList() {
      try {
        if (this.diagramType !== "controller") {
          const data = {
            currentPage: 1,
            pageSize: -1,
            searchKey: "",
            // selectedType: this.selectedType,
          };
          // 假设接口返回所有模型
          const response = await api.queryModelList(data); // 获取模型列表
          const models = response.data.data;

          // 去除当前模型（假设你有当前模型 ID）
          const currentModelId = this.modelId; // 假设从路由获取当前模型 ID
          const filteredModels = models.filter(
            (model) => model.id !== currentModelId
          );

          // console.log("Filtered Models:", filteredModels);

          // 批量请求图标数据
          const iconIds = filteredModels
            .map((model) => model.iconId)
            .filter(Boolean); // 获取所有 iconId

          // 批量请求图标数据，缓存命中则跳过
          const uncachedIconIds = iconIds.filter((id) => !this.iconCache[id]);
          const iconResponses = await Promise.all(
            uncachedIconIds.map((id) => api.queryIcon(id))
          );
          iconResponses.forEach((res, index) => {
            const iconData = res.data?.data?.data; // 提取 Base64 数据
            if (iconData) {
              this.iconCache[uncachedIconIds[index]] = iconData; // 缓存图标数据
            }
          });

          // 格式化模型数据
          this.modelList = filteredModels.map((model) => ({
            label: model.name,
            type: model.modelType || "未分类",
            category: model.category || "未分组",
            icon: this.iconCache[model.iconId] || "/img/default-icon.svg", // 使用缓存中的 Base64 数据
            shape: "custom-model",
          }));

          // 将模型合并到 `configList` 中
          this.configList = [...this.configList, ...this.modelList];
        }

        this.categorizeComponents(this.configList);
        this.initializeCategoryState();
        // console.log("Final Config List:", this.configList);
      } catch (error) {
        console.error("获取模型列表失败：", error);
      }
    },
    categorizeComponents(components) {
      const categorized = {};
      components.forEach((component) => {
        const type = component.category || "未分组";
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
    resolveIconUrl(icon) {
      if (icon.startsWith("data:image")) {
        // Base64 格式的图标，直接返回
        return icon;
      }
      if (icon.startsWith("/") || icon.startsWith("http")) {
        // URL 格式的图标，直接返回
        return icon;
      }
      // 否则，返回默认图标路径
      return "/img/default-icon.svg";
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
