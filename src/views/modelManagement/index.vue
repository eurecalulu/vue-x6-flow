<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="modelSearchQuery" placeholder="模型搜索"></el-input>
      </el-col>
      <el-col :span="4">
        <el-select v-model="selectedType" placeholder="模型类别">
          <el-option
            v-for="item in modelCategories"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-col>
      <el-col :span="4" :offset="8" class="create-project">
        <el-button type="success" @click="openCreateModal">新建</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="modelData" style="width: 100%" class="model-table">
      <el-table-column
        prop="name"
        label="模型名"
        width="150"
        sortable
      ></el-table-column>
      <!-- 使用 el-tooltip 包裹 modelDescription -->
      <el-table-column label="模型说明" width="150">
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
      <el-table-column
        prop="type"
        label="模型类别"
        width="150"
        sortable
      ></el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-link @click="editModel(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="exportModel(scope.row)">导出</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="danger" @click="deleteModel(scope.row)">删除</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="openDiagramEditor(scope.row)">内容编辑</el-link>
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
      style="text-align: center; margin-top: 20px"
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
      selectedType: "",
      modelCategories: [
        { value: "air-conditioning", label: "空调机理模型" },
        { value: "energy-storage", label: "储能机理模型" },
        { value: "solar", label: "太阳能模型" },
      ],
      modelData: [
        // {
        //   modelName: "大金空调机理模型",
        //   modelDescription: "大金空调机理模型",
        //   modelCategory: "空调机理模型",
        // },
        // {
        //   modelName: "华电储能机理模型",
        //   modelDescription: "储能机理模型",
        //   modelCategory: "储能机理模型",
        // },
      ],
      total: 0,
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
      // console.log(
      //   "搜索内容：",
      //   this.modelSearchQuery,
      //   "模型类别：",
      //   this.selectedCategory
      // );
      this.fetchModelList();
    },
    async handleCreateOrUpdateModel(form) {
      try {
        if (form.id) {
          // 更新模型
          const response = await api.updateModel(form);
          if (response.data.status === 200) {
            this.$message.success("更新模型成功");
          }
        } else {
          // 创建 diagram，并将其关联到新模型
          const diagramResponse = await this.addDiagram({ name: form.name });
          const diagramId = diagramResponse.data.id;
          // 新建模型
          // 新建模型并包含 diagramId
          const modelData = {
            ...form,
            diagramId, // 将生成的 diagramId 作为模型的属性
          };

          const response = await api.addModel(modelData);
          if (response.data.status === 200) {
            this.$message.success("新建模型成功");
          }
        }
        this.fetchModelList();
      } catch (error) {
        this.$message.error("操作失败，请重试");
      }
      this.closeCreateModal();
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
        selectedType: this.selectedType,
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
      // 跳转到 Diagram 编辑页面，传递模型的 diagramId
      await this.$router.push({ name: "DiagramEditor", params: { diagramId } });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 40px auto;
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
  margin-top: 20px;
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
</style>
