<template>
  <el-container style="height: 100vh">
    <!-- Header -->
    <el-header
      style="
        background-color: #f7f7f7;
        color: #333;
        text-align: center;
        font-size: 1.4rem;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        height: 45px;
        line-height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      综合能源EMS能碳云智能优化调控平台
    </el-header>

    <!-- Layout -->
    <el-container>
      <!-- Left Sidebar -->
      <el-aside
        width="10%"
        style="background-color: #f7f7f7; border-right: 0.2px solid #ddd"
      >
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
          class="custom-menu"
        >
          <el-menu-item index="modelManagement">模型管理</el-menu-item>
          <el-menu-item index="projectManagement">项目管理</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- Main Content -->
      <el-main style="background-color: #f0f0f0">
        <!-- 根据 activeMenu 渲染不同的内容 -->
        <ModelManagementIndex v-if="activeMenu === 'modelManagement'" />
        <ProjectManagementIndex v-if="activeMenu === 'projectManagement'" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import ModelManagementIndex from "./modelManagement/index.vue";
import ProjectManagementIndex from "./projectManagement/index.vue";

export default {
  name: "mainPage",
  components: {
    ModelManagementIndex,
    ProjectManagementIndex,
  },
  data() {
    return {
      // 默认显示模型管理页面
      activeMenu: "modelManagement",
    };
  },
  methods: {
    handleMenuSelect(index) {
      this.activeMenu = index;
    },
  },
};
</script>

<style scoped>
.custom-menu {
  background-color: #e1e1e1; /* 设置菜单背景色 */
  color: black; /* 设置默认字体颜色 */
}

/* 修改选中项的颜色 */
.custom-menu .el-menu-item.is-active {
  background-color: #555555; /* 设置选中项的背景色 */
  color: white; /* 设置选中项的文字颜色 */
}

.el-main {
  background-color: #f9f9f9;
  padding: 20px;
}
</style>
