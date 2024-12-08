<template>
  <el-dialog
    v-dialog-drag
    :visible.sync="isVisible"
    title="信号绑定配置"
    width="50%"
    :modal="false"
    @close="handleClose"
  >
    <el-form
      :model="localSignalsBindData"
      ref="signalsBindForm"
      label-width="25%"
      label-position="left"
    >
      <!-- 输入框样式 -->
      <el-form-item label="设备号" class="form-item">
        <el-input
          v-model="localSignalsBindData.deviceId"
          placeholder="请输入设备号"
        ></el-input>
      </el-form-item>

      <el-form-item label="SOC" class="form-item">
        <el-input
          v-model="localSignalsBindData.SOC"
          placeholder="请输入SOC"
        ></el-input>
      </el-form-item>

      <el-form-item label="充放电状态" class="form-item">
        <el-input
          v-model="localSignalsBindData.powerState"
          placeholder="请输入充放电状态"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button class="parameter-custom-button" @click="handleConfirm"
        >确认</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "SignalBindConfig",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    signalsBindData: {
      type: Object,
      default: () => ({
        deviceId: "",
        SOC: "",
        powerState: "",
      }),
    },
  },
  data() {
    return {
      localSignalsBindData: { ...this.signalsBindData },
      isVisible: this.visible,
    };
  },
  watch: {
    visible(newVal) {
      this.isVisible = newVal;
    },
    signalsBindData(newVal) {
      this.localSignalsBindData = { ...newVal };
    },
    isVisible(newVal) {
      // 当本地 isVisible 变化时，通知父组件更新 visible
      this.$emit("update:visible", newVal);
    },
  },
  methods: {
    handleClose() {
      this.isVisible = false;
      this.$emit("update:visible", false); // 向父组件更新弹窗状态
    },
    handleConfirm() {
      // 传递更新后的信号绑定数据
      this.$emit("update-signals-bind", this.localSignalsBindData);
      this.handleClose();
    },
  },
};
</script>

<style scoped>
.form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>
