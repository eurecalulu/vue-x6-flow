<template>
  <div class="simulation-output">
    <!-- 模拟进度条 -->
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
    <!-- 输出内容 -->
    <div class="output-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="编译" name="compile">
          <pre>{{ compileOutput }}</pre>
        </el-tab-pane>
        <el-tab-pane label="输出" name="output">
          <pre>{{ outputLog }}</pre>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
export default {
  name: "SimulationOutput",
  data() {
    return {
      progress: 100, // 模拟进度值，您可以动态更新它
      activeTab: "compile",
      compileOutput:
        "The initialization finished successfully without homotopy method.",
      outputLog: "### STATISTICS ###\nThe simulation finished successfully.",
    };
  },
};
</script>

<style scoped>
.simulation-output {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
}

.progress-bar {
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.5s ease;
}

.output-tabs {
  flex: 1;
  overflow: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
