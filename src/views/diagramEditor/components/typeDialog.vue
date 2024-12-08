<template>
  <el-dialog
    :visible.sync="dialogVisible"
    title="选择节点类别"
    @close="handleClose"
  >
    <el-select
      v-model="selectedCategory"
      placeholder="请选择节点分类"
      style="width: 200px"
    >
      <el-option label="控制单元" value="控制单元"></el-option>
      <el-option label="处理单元" value="处理单元"></el-option>
      <el-option label="信号单元" value="信号单元"></el-option>
      <!-- 你可以根据需要添加更多的 category 选项 -->
    </el-select>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="confirmCategory">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      selectedCategory: "", // 当前选中的category
      resolveCategory: null, // 保存resolve函数
    };
  },
  methods: {
    openDialog() {
      return new Promise((resolve) => {
        this.dialogVisible = true; // 打开弹窗
        this.resolveCategory = resolve; // 保存resolve函数
      });
    },
    confirmCategory() {
      if (this.selectedCategory) {
        this.resolveCategory(this.selectedCategory); // 返回选中的category
      }
      this.dialogVisible = false; // 关闭弹窗
    },
    handleClose() {
      this.dialogVisible = false; // 关闭弹窗
    },
  },
};
</script>

<style scoped>
/* 样式根据需要调整 */
</style>
