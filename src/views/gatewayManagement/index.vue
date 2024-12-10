<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="searchKey" placeholder="网关机搜索"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button class="gray-button" type="primary" @click="handleSearch"
          >搜索</el-button
        >
      </el-col>
      <el-col :span="4" :offset="8" class="create-gateway">
        <el-button class="gray-button" type="success" @click="openCreateModal"
          >添加网关机</el-button
        >
      </el-col>
    </el-row>
    <el-table :data="gatewayList" class="gateway-table">
      <el-table-column label="网关机名称" prop="name" />
      <el-table-column label="网关机IP" prop="ipAddress" />
      <el-table-column label="网关机端口" prop="port" />
      <el-table-column label="网关机状态">
        <template slot-scope="scope">
          <span v-if="scope.row.communicationStatus">健康</span>
          <span v-else>下线</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-link @click="editGateway(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link
            class="low-saturation-danger"
            @click="deleteGateway(scope.row)"
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
    <CreateGatewayDialog
      :isVisible="isCreateModalVisible"
      :gatewayData="currentGateway"
      @close="closeCreateModal"
      @submit="handleCreateOrUpdateGateway"
    />
  </div>
</template>

<script>
import api from "@/api"; // 导入 API 模块
import CreateGatewayDialog from "./CreateGatewayDialog.vue"; // 引入 CreateProjectDialog 组件

export default {
  name: "GatewayManagementIndex",
  components: {
    CreateGatewayDialog,
  },
  data() {
    return {
      searchKey: "", // 搜索关键字
      gatewayList: [], // 项目列表
      isCreateModalVisible: false,
      total: 8,
      pageSize: 8,
      currentPage: 1,
      currentGateway: null,
    };
  },
  mounted() {
    this.fetchGatewayList();
  },
  methods: {
    handleSearch() {
      this.fetchGatewayList();
    },
    async handleCreateOrUpdateGateway(form) {
      try {
        if (form.id) {
          // 更新模型
          await this.updateGateway(form);
        } else {
          // 新建模型并包含 diagramId
          await this.createGateway(form);
        }
        this.fetchGatewayList();
      } catch (error) {
        this.$message.error(`操作失败：${error.message}`);
      } finally {
        this.closeCreateModal();
      }
    },

    async updateGateway(form) {
      try {
        const response = await api.updateGateway(form);
        if (response.data.status === 200) {
          this.$message.success("更新网关机成功");
        } else {
          throw new Error("更新网关机失败");
        }
      } catch (error) {
        throw new Error(`更新网关机请求失败：${error.message}`);
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

    async createGateway(modelData) {
      try {
        const response = await api.addGateway(modelData);
        if (response.data.status === 200) {
          this.$message.success("添加网关机成功");
        } else {
          throw new Error("添加网关机失败");
        }
      } catch (error) {
        throw new Error(`添加网关机请求失败：${error.message}`);
      }
    },

    async editGateway(row) {
      const response = await api.queryGateway(row.id);
      if (response.data.status === 200) {
        this.currentGateway = response.data.data;
        this.isCreateModalVisible = true;
      }
    },
    async deleteGateway(row) {
      try {
        await this.$confirm("确认删除该网关机吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const response = await api.deleteGateway(row.id);
        if (response.data.status === 200) {
          this.$message.success("删除网关机成功");
          this.fetchGatewayList();
        }
      } catch (error) {
        this.$message.error("删除网关机失败");
      }
    },
    async fetchGatewayList() {
      const data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        searchKey: this.searchKey,
      };
      const response = await api.queryGatewayList(data);
      if (response.data.status === 200) {
        this.gatewayList = response.data.data.records; // 确保传递给 ElTable 的数据是数组
        this.total = response.data.data.total; // 设置总条目数用于分页
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchGatewayList();
    },
    openCreateModal() {
      this.currentGateway = null;
      this.isCreateModalVisible = true;
    },
    closeCreateModal() {
      this.isCreateModalVisible = false;
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
.create-gateway {
  text-align: right;
}
.gateway-table {
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
