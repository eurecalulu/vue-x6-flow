<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="searchQuery" placeholder="工程搜索"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button class="gray-button" type="primary" @click="handleSearch"
          >搜索</el-button
        >
      </el-col>
      <el-col :span="4" :offset="10" class="create-project">
        <el-button class="gray-button" type="success" @click="createProject"
          >新建项目</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" class="project-table">
      <el-table-column prop="projectName" label="工程名"></el-table-column>
      <el-table-column prop="description" label="项目说明"></el-table-column>
      <el-table-column prop="gateway" label="绑定网关机">
        <template slot-scope="scope">
          <span v-if="scope.row.gateway">{{ scope.row.gateway }}</span>
          <span v-else>未绑定</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-link @click="editProject(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="downloadDocument(scope.row)">策略文件下载</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link
            class="low-saturation-danger"
            @click="deleteProject(scope.row)"
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
  </div>
</template>

<script>
export default {
  name: "ProjectManagementIndex",
  data() {
    return {
      searchQuery: "",
      tableData: [
        {
          projectName: "北湖街道工程",
          description: "综合优化",
          gateway: "北湖街道网关机1",
        },
        {
          projectName: "北湖街道工程",
          description: "负荷预测",
          gateway: "",
        },
        {
          projectName: "南湖街道工程",
          description: "线路修复",
          gateway: "南湖街道网关机2",
        },
        {
          projectName: "东风路项目",
          description: "设备维护",
          gateway: "东风路网关机3",
        },
        {
          projectName: "西山路工程",
          description: "数据监控",
          gateway: "西山路网关机4",
        },
        {
          projectName: "中央广场项目",
          description: "智能化改造",
          gateway: "中央广场网关机5",
        },
        {
          projectName: "环城大道工程",
          description: "负荷预测",
          gateway: "",
        },
      ],
      total: 7,
      pageSize: 8,
    };
  },
  methods: {
    handleSearch() {
      console.log("搜索内容：", this.searchQuery);
    },
    createProject() {
      console.log("新建项目");
    },
    editProject(row) {
      console.log("编辑项目：", row.projectName);
    },
    downloadDocument(row) {
      console.log("下载策略文件：", row.projectName);
    },
    deleteProject(row) {
      console.log("删除项目：", row.projectName);
    },
    handlePageChange(page) {
      console.log("当前页：", page);
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

.low-saturation-danger {
  color: #8b0000 !important; /* 更柔和的红色 */
  transition: color 0.3s ease;
}

.low-saturation-danger:hover {
  color: #b22222 !important; /* 鼠标悬停时稍深的红色 */
}
</style>
