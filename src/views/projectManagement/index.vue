<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="searchKey" placeholder="项目搜索"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button class="gray-button" type="primary" @click="handleSearch"
          >搜索</el-button
        >
      </el-col>
      <el-col :span="4" :offset="8" class="create-project">
        <el-button class="gray-button" type="success" @click="openCreateModal"
          >新建项目</el-button
        >
      </el-col>
    </el-row>
    <el-table :data="projectList" class="project-table">
      <el-table-column label="项目名称" prop="name" />
      <el-table-column label="项目说明" width="200">
        <template v-slot="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.properties?.projectDescription || '暂无描述'"
            placement="top"
            :popper-class="'custom-tooltip'"
          >
            <span class="truncate-text">{{
              scope.row.properties?.projectDescription || "暂无描述"
            }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="绑定网关" prop="gatewayId" width="180" />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-link @click="editProject(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="openDiagramEditor(scope.row)">设计</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="openSimulation(scope.row)">仿真</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="exportStrategy(scope.row)">策略下发</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link
            class="low-saturation-danger"
            @click="deleteProject(scope.row)"
            >删除</el-link
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
      class="dark-pagination"
    ></el-pagination>

    <!-- 使用 CreateProjectDialog 组件 -->
    <CreateProjectDialog
      :isVisible="isCreateModalVisible"
      :projectData="currentProject"
      @close="closeCreateModal"
      @submit="handleCreateOrUpdateProject"
    />
  </div>
</template>

<script>
import api from "@/api"; // 导入 API 模块
import CreateProjectDialog from "./CreateProjectDialog.vue"; // 引入 CreateProjectDialog 组件

export default {
  name: "ProjectManagementIndex",
  components: {
    CreateProjectDialog,
  },
  data() {
    return {
      searchKey: "", // 搜索关键字
      projectList: [], // 项目列表
      isCreateModalVisible: false,
      total: 8,
      pageSize: 8,
      currentPage: 1,
      currentProject: null,
    };
  },
  mounted() {
    this.fetchProjectList();
  },
  methods: {
    editProperties(data) {
      console.log(data);
    },
    exportStrategy(data) {
      console.log(data);
    },
    handleSearch() {
      this.fetchModelList();
    },
    async handleCreateOrUpdateProject(form) {
      try {
        if (form.id) {
          // 更新模型
          await this.updateProject(form);
        } else {
          // 创建 diagram，并将其关联到新模型
          const diagramId = await this.createDiagram(form.name);
          // 新建模型并包含 diagramId
          await this.createProject({ ...form, diagramId });
        }
        this.fetchProjectList();
      } catch (error) {
        this.$message.error(`操作失败：${error.message}`);
      } finally {
        this.closeCreateModal();
      }
    },

    async updateProject(form) {
      try {
        const response = await api.updateProject(form);
        if (response.data.status === 200) {
          this.$message.success("更新项目成功");
        } else {
          throw new Error("更新项目失败");
        }
      } catch (error) {
        throw new Error(`更新项目请求失败：${error.message}`);
      }
    },

    async createDiagram(name) {
      try {
        const response = await api.addDiagram({ name });
        if (response.data.status === 201) {
          return response.data.data.id; // 返回 diagramId
        } else {
          throw new Error("创建 Diagram 失败");
        }
      } catch (error) {
        throw new Error(`创建 Diagram 请求失败：${error.message}`);
      }
    },

    async createProject(modelData) {
      try {
        const response = await api.addProject(modelData);
        if (response.data.status === 201) {
          this.$message.success("新建项目成功");
        } else {
          throw new Error("新建项目失败");
        }
      } catch (error) {
        throw new Error(`新建项目请求失败：${error.message}`);
      }
    },

    async editProject(row) {
      const response = await api.queryProject(row.id);
      if (response.data.status === 200) {
        this.currentProject = response.data.data;
        this.isCreateModalVisible = true;
      }
    },
    async deleteProject(row) {
      try {
        await this.$confirm("确认删除该项目吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const response = await api.deleteProject(row.id);
        if (response.data.status === 200) {
          this.$message.success("删除项目成功");
          this.fetchProjectList();
        }
      } catch (error) {
        this.$message.error("删除项目失败");
      }
    },
    async fetchProjectList() {
      const data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        searchKey: this.searchKey,
      };
      const response = await api.queryProjectPageList(data);
      if (response.data.status === 200) {
        this.projectList = response.data.data.records; // 确保传递给 ElTable 的数据是数组
        this.total = response.data.data.total; // 设置总条目数用于分页
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchProjectList();
    },
    openCreateModal() {
      this.currentProject = null;
      this.isCreateModalVisible = true;
    },
    closeCreateModal() {
      this.isCreateModalVisible = false;
    },
    exportPolicy() {
      console.log("export model");
    },
    async openDiagramEditor(row) {
      let diagramId = row.diagramId;
      let projectId = row.id;
      // 跳转到 Diagram 编辑页面，传递模型的 diagramId
      await this.$router.push({
        name: "DiagramEditor",
        params: { diagramId, projectId, diagramType: "simulation" },
      });
    },
    async openSimulation(row) {
      let diagramId = row.diagramId;
      let projectId = row.id;
      // 跳转到 Diagram 编辑页面，传递模型的 diagramId
      await this.$router.push({
        name: "simulation",
        params: { diagramId, projectId },
        replace: false, // 确保不会替换历史记录
      });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 95%;
  max-height: 90%;
  margin: 20px auto;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
}
.search-bar {
  margin-bottom: 20px;
}
.create-project {
  text-align: right;
}
.project-table {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 50px;
}

.gray-button {
  background-color: #4a4a4a !important;
  color: #ffffff !important;
  border: none;
  transition: background-color 0.3s ease;
}
.gray-button:hover {
  background-color: #3a3a3a !important;
}

.dark-pagination ::v-deep .el-pager li,
.dark-pagination ::v-deep .el-pagination__next,
.dark-pagination ::v-deep .el-pagination__prev {
  color: #555555 !important;
}

.dark-pagination ::v-deep .el-pager li.active,
.dark-pagination ::v-deep .el-pagination__next:hover,
.dark-pagination ::v-deep .el-pagination__prev:hover {
  background-color: #555555 !important;
  color: #ffffff !important;
}

.el-tooltip {
  font-size: 14px;
}

/* 饱和度更低的红色删除链接样式 */
.low-saturation-danger {
  color: #8b0000 !important; /* 更柔和的红色 */
  transition: color 0.3s ease;
}

.low-saturation-danger:hover {
  color: #b22222 !important; /* 鼠标悬停时稍深的红色 */
}
</style>
