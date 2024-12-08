<template>
  <div class="simulation-output">
    <!-- 进度条和操作按钮 -->
    <div class="progress-header" v-if="isSimulationRunning">
      <span class="progress-label">仿真进度</span>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="action-buttons">
        <el-button class="cancel-button" size="mini" @click="cancelSimulation"
          >取消仿真</el-button
        >
        <el-button class="open-button" size="mini" @click="openOutputFile"
          >打开输出文件</el-button
        >
        <el-button class="open-button" size="mini" @click="openOutputFile"
          >查看仿真结果</el-button
        >
      </div>
    </div>

    <!-- 输出内容 -->
    <div class="output-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="编译" name="compile">
          <div class="compile-area">
            <pre>{{ compileOutput }}</pre>
          </div>
        </el-tab-pane>
        <el-tab-pane label="输出" name="output">
          <div class="output-area">
            <pre>{{ outputLog }}</pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimulationOutput",
  props: {
    isSimulationRunning: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      progress: 100, // 模拟进度值
      activeTab: "output", // 默认选中“输出”标签页
      compileOutput:
        "The initialization finished successfully without homotopy method.",
      outputLog:
        "### STATISTICS ###\nThe simulation finished successfully.###\nThe simulation finished successfully.###\nThe simulation finished successfully.###\nThe simulation finished successfully.",
    };
  },
  methods: {
    cancelSimulation() {
      this.$message.warning("仿真已取消！");
      this.$emit("cancel-simulation");
    },
    openOutputFile() {
      this.$message.info("打开输出文件的功能还未实现！");
    },
    updateOutputLog(newLog) {
      this.outputLog = newLog;
      this.activeTab = "output";
    },
    updateCompileOutput(newLog) {
      this.compileOutput = newLog;
      this.activeTab = "compile";
    },
  },
};
</script>

<style scoped>
.simulation-output {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  padding: 10px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.progress-label {
  font-size: 13px; /* 调整字体大小 */
  color: #4a4a4a; /* 字体颜色 */
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.progress-bar {
  flex: 0 0 60%; /* 占 70% 宽度 */
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.progress {
  height: 100%;
  background-color: #5e8b7e;
  transition: width 0.5s ease;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.cancel-button {
  background-color: #8b0000; /* 取消按钮颜色 */
  color: #fff;
}

.open-button {
  background-color: #4a4a4a; /* 打开按钮颜色 */
  color: #fff;
}

.output-tabs {
  flex: 1;
  overflow: auto;
  border-top: 1px solid #ddd;
}

.compile-area {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #d9e2ec;
  height: 80%;
}

.output-area {
  background-color: #f9f9f9; /* 浅灰背景 */
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
