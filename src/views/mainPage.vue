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
      综合能源EMS能碳云数模智能仿真与优化控制管理平台
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
          <el-menu-item index="/modelManagement">模型管理</el-menu-item>
          <el-menu-item index="/projectManagement">项目管理</el-menu-item>
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
  computed: {
    // 动态绑定 activeMenu 为当前路由路径
    activeMenu() {
      return this.$route.path.split("/").pop(); // 获取路由路径的最后一部分
    },
  },
  methods: {
    handleMenuSelect(path) {
      if (path !== this.$route.path) {
        this.$router.push(path); // 仅当目标路径不同于当前路径时才导航
      }
    },
  },
};
</script>

<style scoped>
.custom-menu {
  background-color: #e1e1e1; /* 设置菜单背景色 */
  color: black; /* 设置默认字体颜色 */
}

/* 确保选中项始终保持自定义的背景色和文字颜色 */
.custom-menu >>> .el-menu-item.is-active {
  background-color: #555555 !important; /* 选中项背景色 */
  color: white !important; /* 选中项文字颜色 */
}

/* 鼠标悬停时与选中项颜色一致 */
.custom-menu >>> .el-menu-item:hover {
  background-color: #555555 !important; /* 悬停背景色 */
  color: white !important; /* 悬停文字颜色 */
}

.el-main {
  background-color: #f9f9f9;
  padding: 20px;
}
</style>
