<template>
  <el-drawer
    :visible="visible"
    direction="rtl"
    size="25%"
    :with-header="false"
    @close="handleClose"
    class="node-details-drawer"
    style="padding: 0 0"
  >
    <!-- 表单 -->
    <div>
      <div style="margin-top: 12%; margin-right: 10%; margin-left: 10%">
        <el-form
          :model="localControllerNodeData"
          ref="nodeForm"
          label-width="25%"
          label-position="left"
        >
          <!-- 节点基础属性 -->
          <div style="margin-bottom: 15%">
            <h3>节点属性</h3>
            <el-form-item label="节点号" class="form-item">
              <el-input v-model="localControllerNodeData.number"></el-input>
            </el-form-item>
            <el-form-item label="节点名称" class="form-item">
              <el-input v-model="localControllerNodeData.name"></el-input>
            </el-form-item>
            <el-form-item label="节点类型" class="form-item">
              <el-select
                v-model="localControllerNodeData.controllerNodeType"
                placeholder="请选择节点类型"
              >
                <el-option label="起始节点" value="起始节点"></el-option>
                <el-option label="中间节点" value="中间节点"></el-option>
                <el-option label="结束节点" value="结束节点"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="节点功能脚本" class="form-item">
              <el-input
                type="textarea"
                :rows="3"
                v-model="localControllerNodeData.scripts"
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
  name: "ControllerNodeDetailsModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    nodeData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localControllerNodeData: {
        ...this.nodeData,
      },
      rules: {},
    };
  },
  watch: {
    nodeData: {
      deep: true,
      handler(newVal) {
        this.localControllerNodeData = newVal; // 当 props 发生变化时，更新局部数据
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
    },
    handleSubmit() {
      // 提交表单并触发提交事件
      this.$emit("submit", this.localControllerNodeData); // 通过 $emit 发送数据给父组件
      this.handleClose(); // 关闭抽屉
    },
  },
};
</script>

<style scoped>
.node-details-drawer {
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.1);
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
