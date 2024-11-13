<template>
  <el-drawer
    :visible="visible"
    title="节点详情"
    direction="rtl"
    size="30%"
    :with-header="true"
    @close="handleClose"
  >
    <!-- 表单 -->
    <el-form :model="localNodeData" ref="nodeForm" label-width="100px">
      <!-- 节点基础属性 -->
      <h4>节点基础属性</h4>
      <el-form-item label="节点 ID">
        <el-input v-model="localNodeData.id" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="节点标签">
        <el-input v-model="localNodeData.label"></el-input>
      </el-form-item>
      <el-form-item label="填充颜色">
        <el-color-picker v-model="localNodeData.fillColor"></el-color-picker>
      </el-form-item>
      <el-form-item label="线条宽度">
        <el-input-number
          v-model="localNodeData.lineWidth"
          :min="1"
          :max="10"
        ></el-input-number>
      </el-form-item>

      <!-- 业务属性（仅在 type 为 'generator' 时显示） -->
      <!--      <div v-if="localNodeData.type === 'generator'">-->
      <div>
        <h4>业务属性</h4>
        <el-form-item label="参数">
          <el-input
            v-model="localNodeData.parameters"
            placeholder="Parameter Real Un 额定功率"
          ></el-input>
        </el-form-item>
        <el-form-item label="输入">
          <el-input
            v-model="localNodeData.input"
            placeholder="Real P"
          ></el-input>
        </el-form-item>
        <el-form-item label="输出">
          <el-input
            v-model="localNodeData.output"
            placeholder="Real Heat"
          ></el-input>
        </el-form-item>
        <el-form-item label="脚本">
          <el-input
            type="textarea"
            :rows="3"
            v-model="localNodeData.script"
            placeholder="der(kWh) = P"
          ></el-input>
        </el-form-item>
      </div>

      <!-- 按钮操作区 -->
      <div style="text-align: right; margin-top: 20px">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </div>
    </el-form>
  </el-drawer>
</template>

<script>
export default {
  name: "NodeDetailsModal",
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
      localNodeData: JSON.parse(JSON.stringify(this.nodeData)), // 深拷贝，防止修改 props
    };
  },
  watch: {
    nodeData: {
      deep: true,
      handler(newVal) {
        this.localNodeData = JSON.parse(JSON.stringify(newVal)); // 当 props 发生变化时，更新局部数据
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit("update:visible", false);
    },
    handleSubmit() {
      // 提交表单并触发提交事件
      this.$emit("submit", this.localNodeData); // 通过 $emit 发送数据给父组件
      this.handleClose(); // 关闭抽屉
    },
  },
};
</script>

<style scoped>
.node-details-drawer {
  height: calc(100vh - 120px); /* Set height to avoid covering the menu */
  top: 60px; /* Align with the header */
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Allow scrolling if content overflows */
}
</style>
