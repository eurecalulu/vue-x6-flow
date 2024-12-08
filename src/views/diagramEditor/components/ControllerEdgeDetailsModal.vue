<template>
  <el-drawer
    :visible="visible"
    direction="rtl"
    size="25%"
    :with-header="false"
    @close="handleClose"
    class="edge-details-drawer"
    style="padding: 0 0"
  >
    <!-- 表单 -->
    <div>
      <div style="margin-top: 12%; margin-right: 10%; margin-left: 10%">
        <el-form
          :model="localEdgeData"
          ref="edgeForm"
          label-width="25%"
          label-position="left"
        >
          <!-- 连接基础属性 -->
          <div style="margin-bottom: 15%">
            <h3>连接属性</h3>
            <el-form-item label="事件名称" class="form-item">
              <el-input v-model="localEdgeData.name"></el-input>
            </el-form-item>
            <el-form-item label="事件判定脚本" class="form-item">
              <el-input v-model="localEdgeData.judgmentScripts"></el-input>
            </el-form-item>
            <el-form-item label="动作功能脚本" class="form-item">
              <el-input
                type="textarea"
                :rows="3"
                v-model="localEdgeData.actionScripts"
              ></el-input>
            </el-form-item>
          </div>
          <!-- 按钮操作区 -->
          <div style="text-align: right; margin-top: 20px">
            <el-button @click="handleClose" class="cancel-button"
              >取消</el-button
            >
            <el-button
              type="primary"
              @click="handleSubmit"
              class="confirm-button"
              >确认</el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: "ControllerEdgeDetailsModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    edgeData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localEdgeData: this.edgeData,
      rules: {},
    };
  },
  watch: {
    edgeData: {
      deep: true,
      handler(newVal) {
        this.localEdgeData = newVal; // 当 props 发生变化时，更新局部数据
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
    },
    handleSubmit() {
      // 提交表单并触发提交事件
      this.$emit("submit", this.localEdgeData); // 通过 $emit 发送数据给父组件
      this.handleClose(); // 关闭抽屉
    },
  },
};
</script>

<style scoped>
.edge-details-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Allow scrolling if content overflows */
}

/* 按钮样式 */
.cancel-button {
  color: #666;
  border-color: #ccc;
}

.confirm-button {
  background-color: #555555; /* 深灰色主色 */
  border-color: #555555;
  color: #fff;
}
</style>
