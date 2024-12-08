<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="modelSearchQuery" placeholder="模型搜索"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button class="gray-button" type="primary" @click="handleSearch"
          >搜索</el-button
        >
      </el-col>
      <el-col :span="4" :offset="8" class="create-project">
        <el-button class="gray-button" type="success" @click="openCreateModal"
          >新建</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="modelData" class="model-table">
      <el-table-column prop="name" label="模型名" sortable></el-table-column>
      <!-- 使用 el-tooltip 包裹 modelDescription -->
      <el-table-column
        prop="modelType"
        label="模型类别"
        sortable
      ></el-table-column>
      <el-table-column
        prop="category"
        label="模型目录"
        sortable
      ></el-table-column>
      <el-table-column label="模型说明">
        <template v-slot="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row.properties?.modelDescription || '暂无描述'"
            placement="top"
            :popper-class="'custom-tooltip'"
          >
            <span class="truncate-text">{{
              scope.row.properties?.modelDescription || "暂无描述"
            }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-link @click="editModel(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="openDiagramEditor(scope.row)">设计</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="exportModel(scope.row)">导出</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link class="low-saturation-danger" @click="deleteModel(scope.row)"
            >删除</el-link
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      @current-change="handlePageChange"
      class="dark-pagination"
    ></el-pagination>

    <!-- 新建/编辑模型 Modal -->
    <CreateModelDialog
      :isVisible.sync="isCreateModalVisible"
      :modelData="currentModel"
      @submit="handleCreateOrUpdateModel"
      @close="closeCreateModal"
    />
  </div>
</template>

<script>
import CreateModelDialog from "./CreateModelDialog.vue";
import api from "@/api";

export default {
  name: "ModelManagementIndex",
  components: {
    CreateModelDialog,
  },
  data() {
    return {
      modelSearchQuery: "",
      // selectedType: "",
      modelData: [],
      total: 8,
      pageSize: 8,
      isCreateModalVisible: false,
      currentModel: null,
      currentPage: 1,
    };
  },
  // 页面加载时调用一次
  mounted() {
    this.fetchModelList();
  },
  methods: {
    handleSearch() {
      this.fetchModelList();
    },

    async handleCreateOrUpdateModel(form) {
      try {
        if (form.id) {
          // 更新模型
          await this.updateModel(form);
        } else {
          // 创建 diagram，并将其关联到新模型
          const diagramId = await this.createDiagram(form.name);
          // 新建模型并包含 diagramId
          await this.createModel({ ...form, diagramId });
        }
        this.fetchModelList();
      } catch (error) {
        this.$message.error(`操作失败：${error.message}`);
      } finally {
        this.closeCreateModal();
      }
    },

    async updateModel(form) {
      try {
        // 根据 modelType 设置 type 字段
        const type =
          form.modelType === "控制单元" ? "controller" : "simulation";
        // 将 type 添加到 modelData 中
        const response = await api.updateModel({ ...form, type });
        // const response = await api.updateModel(form);
        if (response.data.status === 200) {
          this.$message.success("更新模型成功");
        } else {
          throw new Error("更新模型失败");
        }
      } catch (error) {
        throw new Error(`更新模型请求失败：${error.message}`);
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

    async createModel(modelData) {
      try {
        // 根据 modelType 设置 type 字段
        const type =
          modelData.modelType === "控制单元" ? "controller" : "simulation";
        // 将 type 添加到 modelData 中
        const response = await api.addModel({ ...modelData, type });
        if (response.data.status === 201) {
          this.$message.success("新建模型成功");
        } else {
          throw new Error("新建模型失败");
        }
      } catch (error) {
        throw new Error(`新建模型请求失败：${error.message}`);
      }
    },

    async editModel(row) {
      const response = await api.queryModel(row.id);
      if (response.data.status === 200) {
        this.currentModel = response.data.data;
        this.isCreateModalVisible = true;
      }
    },
    async deleteModel(row) {
      try {
        await this.$confirm("确认删除该模型吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const response = await api.deleteModel(row.id);
        if (response.data.status === 200) {
          this.$message.success("删除模型成功");
          this.fetchModelList();
        }
      } catch (error) {
        this.$message.error("删除模型失败");
      }
    },
    async fetchModelList() {
      const data = {
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        searchKey: this.modelSearchQuery,
        // selectedType: this.selectedType,
      };
      const response = await api.queryModelList(data);
      if (response.data.status === 200) {
        this.modelData = response.data.data.records; // 确保传递给 ElTable 的数据是数组
        this.total = response.data.data.total; // 设置总条目数用于分页
      }
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchModelList();
    },
    openCreateModal() {
      this.currentModel = null;
      this.isCreateModalVisible = true;
    },
    closeCreateModal() {
      this.isCreateModalVisible = false;
    },
    exportModel() {
      console.log("export model");
    },
    async openDiagramEditor(row) {
      let diagramId = row.diagramId;
      let modelId = row.id;
      // 跳转到 Diagram 编辑页面，传递模型的 diagramId
      await this.$router.push({
        name: "DiagramEditor",
        params: { diagramId, modelId },
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
.model-table {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 50px;
}

.truncate-text {
  display: inline-block;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.custom-tooltip .el-tooltip__popper {
  max-width: 300px; /* 你可以根据需要调整这个宽度 */
  white-space: normal; /* 允许 tooltip 中的文字换行 */
  word-break: break-word; /* 控制长单词的换行 */
}

/* 深灰色按钮样式 */
.gray-button {
  background-color: #4a4a4a !important;
  color: #ffffff !important;
  border: none;
  transition: background-color 0.3s ease;
}
.gray-button:hover {
  background-color: #3a3a3a !important;
}

/* 分页器深灰色样式 */
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

/* 饱和度更低的红色删除链接样式 */
.low-saturation-danger {
  color: #8b0000 !important; /* 更柔和的红色 */
  transition: color 0.3s ease;
}

.low-saturation-danger:hover {
  color: #b22222 !important; /* 鼠标悬停时稍深的红色 */
}
</style>
