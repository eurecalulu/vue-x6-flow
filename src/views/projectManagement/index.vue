<template>
  <div class="container">
    <!-- 搜索栏 -->
    <el-row :gutter="20" class="search-bar">
      <el-col :span="6">
        <el-input v-model="searchQuery" placeholder="工程搜索"></el-input>
      </el-col>
      <el-col :span="2">
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-col>
      <el-col :span="4" :offset="10" class="create-project">
        <el-button type="success" @click="createProject">新建项目</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%" class="project-table">
      <el-table-column
        prop="projectName"
        label="工程名"
        width="150"
      ></el-table-column>
      <el-table-column
        prop="description"
        label="项目说明"
        width="150"
      ></el-table-column>
      <el-table-column prop="gateway" label="绑定网关机" width="150">
        <template slot-scope="scope">
          <span v-if="scope.row.gateway">{{ scope.row.gateway }}</span>
          <span v-else>未绑定</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template slot-scope="scope">
          <el-link @click="editProject(scope.row)">编辑</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link @click="downloadDocument(scope.row)">策略文件下载</el-link>
          <el-divider direction="vertical"></el-divider>
          <el-link type="danger" @click="deleteProject(scope.row)"
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
      style="text-align: center; margin-top: 20px"
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
        { projectName: "北湖街道工程", description: "负荷预测", gateway: "" },
      ],
      total: 8,
      pageSize: 2,
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
  max-width: 800px;
  margin: 40px auto; /* 控制整体居中并增加顶部距离 */
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
  margin-top: 20px;
}
</style>
