<template>
  <el-drawer
    :visible="visible"
    direction="rtl"
    size="25%"
    :with-header="false"
    @close="handleClose"
    class="node-details-drawer"
    style="padding: 0px 0"
  >
    <!-- 表单 -->
    <div>
      <div style="margin-top: 12%; margin-right: 10%; margin-left: 10%">
        <el-form
          :model="localNodeData"
          ref="nodeForm"
          label-width="25%"
          label-position="left"
        >
          <!-- 节点基础属性 -->
          <div style="margin-bottom: 15%">
            <h3>参数</h3>
            <el-form-item label="节点 ID" class="form-item">
              <el-tooltip
                :content="'完整ID: ' + localNodeData.id"
                placement="top"
              >
                <el-input
                  v-model="localNodeData.id"
                  :disabled="true"
                ></el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="节点标签" class="form-item">
              <el-input v-model="localNodeData.name"></el-input>
            </el-form-item>
          </div>
          <div>
            <h3>仿真参数</h3>
            <div v-if="category === '处理单元'">
              <el-form-item label="采样数据最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.simpleDataMinInterval"
                  placeholder="Parameter Real Un 额定功率"
                ></el-input>
              </el-form-item>
              <el-form-item label="控制指令响应最小间隔" class="form-item">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="localNodeData.controllerRespMinInterval"
                  placeholder="der(kWh) = P"
                ></el-input>
              </el-form-item>
            </div>

            <!-- 如果 category 为 '信号单元' -->
            <div v-else-if="category === '信号单元'">
              <el-form-item label="控制最小时间间隔" class="form-item">
                <el-input
                  v-model="localNodeData.controllerOrderMinInterval"
                  placeholder="Select Temperature from S where time=t"
                ></el-input>
              </el-form-item>
            </div>

            <div v-else-if="category === '控制单元'">
              <el-form-item label="控制指令最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.controllerOrderMinInterval"
                  :placeholder="`设备号：11111
温度信号：temp
XX信号：XXX`"
                ></el-input>
              </el-form-item>
              <el-form-item label="采样数据最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.simpleDataMinInterval"
                  :placeholder="`设备号：11111
温度信号：temp
XX信号：XXX`"
                ></el-input>
              </el-form-item>
            </div>

            <div
              v-if="
                category === '处理单元' ||
                category === '信号单元' ||
                category === '控制单元'
              "
            >
              <el-form-item label="设备号" class="form-item">
                <el-input
                  v-model="localNodeData.signalsBindDeviceId"
                  placeholder="XXX-XXX"
                ></el-input>
              </el-form-item>
              <el-form-item label="信号绑定" class="form-item">
                <el-button
                  class="detail-parameter-custom-button"
                  size="small"
                  icon="el-icon-edit"
                  @click="openSignalsBindConfig"
                >
                  信号绑定配置
                </el-button>
              </el-form-item>
              <!-- 输出参数配置 -->
            </div>
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
    <signal-bind-config
      :visible="isSignalsBindConfigVisible"
      :signalsBindData="localNodeData.signalsBindParam"
      @update-signals-bind="updateSignalsBind"
      @update:visible="isSignalsBindConfigVisible = $event"
    />
  </el-drawer>
</template>

<script>
import SignalBindConfig from "./SignalBindConfig.vue";

export default {
  name: "SimuNodeDetailsModal",
  components: {
    SignalBindConfig,
  },
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
      localNodeData: this.nodeData, // 深拷贝，防止修改 props
      isSignalsBindConfigVisible: false, // 控制信号绑定弹窗的显示
      rules: {},
    };
  },
  computed: {
    category() {
      return this.localNodeData && this.localNodeData.properties
        ? this.localNodeData.properties.category
        : "";
    },
  },
  watch: {
    nodeData: {
      deep: true,
      handler(newVal) {
        this.localNodeData = newVal; // 当 props 发生变化时，更新局部数据
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
    openSignalsBindConfig() {
      this.isSignalsBindConfigVisible = true;
    },
    updateSignalsBind(newParameters) {
      this.localNodeData.signalsBindParam = newParameters; // 更新参数数据
    },
  },
};
</script>

<style scoped>
.node-details-drawer {
  box-shadow: -2px 0px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto; /* Allow scrolling if content overflows */
}

.detail-parameter-custom-button {
  background-color: #4a4a4a !important; /* 按钮背景颜色 */
  color: #ffffff !important; /* 按钮文字颜色 */
  border: none !important; /* 移除边框 */
}
.detail-parameter-custom-button:hover {
  background-color: #3a3a3a !important; /* 悬停时的背景颜色 */
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
