<template>
  <el-dialog
    title="仿真结果"
    :visible="visible"
    width="80%"
    :before-close="handleClose"
  >
    <div class="simulation-result">
      <!-- 搜索框 -->
      <el-input
        v-model="searchQuery"
        placeholder="搜索变量"
        prefix-icon="el-icon-search"
        clearable
        @input="filterVariables"
        style="margin-bottom: 20px"
      ></el-input>

      <el-collapse>
        <el-collapse-item
          v-for="(variableGroup, category) in filteredVariables"
          :key="category"
          :title="category"
        >
          <el-checkbox
            v-for="variable in variableGroup"
            :key="variable.variableName"
            v-model="selectedVariables"
            :label="variable.variableName"
            @change="handleVariableSelection"
          >
            <div class="variable-info">
              <div class="variable-name">{{ variable.variableName }}</div>
              <div class="variable-unit">{{ variable.unit }}</div>
              <div class="variable-description">
                {{ variable.description }}
              </div>
            </div>
          </el-checkbox>
        </el-collapse-item>
      </el-collapse>

      <!-- 渲染图表区域 -->
      <div
        v-if="chartData && chartData.length > 0"
        id="chart"
        style="height: 400px"
      ></div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="fetchChartData">生成图表</el-button>
    </span>
  </el-dialog>
</template>

<script>
import * as echarts from "echarts/core";

export default {
  name: "SimulationResultDialog",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    variables: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      searchQuery: "", // 搜索框的关键字
      selectedVariables: [], // 选中的变量
      filteredVariables: this.variables, // 过滤后的变量
      chartData: null, // 存储用于渲染图表的数据
    };
  },
  methods: {
    // 关闭弹框
    handleClose() {
      this.$emit("update:visible", false);
    },

    // 根据搜索框的输入过滤变量
    filterVariables() {
      const searchQuery = this.searchQuery.toLowerCase();
      this.filteredVariables = Object.keys(this.variables).reduce(
        (acc, category) => {
          const filteredVariables = this.variables[category].filter(
            (variable) => {
              return variable.variableName.toLowerCase().includes(searchQuery);
            }
          );
          if (filteredVariables.length) {
            acc[category] = filteredVariables;
          }
          return acc;
        },
        {}
      );
    },

    // 处理勾选的变量
    handleVariableSelection() {
      // 选择的变量
      console.log(this.selectedVariables);
    },

    // 通过 API 获取图表数据
    fetchChartData() {
      if (this.selectedVariables.length === 0) {
        this.$message.warning("请选择至少一个变量！");
        return;
      }

      // 模拟后端接口调用，根据勾选的变量获取数据
      this.$axios
        .post("/api/getChartData", { variables: this.selectedVariables })
        .then((response) => {
          this.chartData = response.data; // 假设返回的数据是用于图表的数据
          this.renderChart(); // 渲染图表
        })
        .catch((error) => {
          console.error("获取图表数据失败", error);
          this.$message.error("获取图表数据失败");
        });
    },

    // 使用 ECharts 渲染图表
    renderChart() {
      if (this.chartData && this.chartData.length) {
        const chartDom = document.getElementById("chart");
        const myChart = echarts.init(chartDom);
        const option = {
          xAxis: {
            type: "category",
            data: this.chartData.map((data) => data.timestamp), // 假设图表数据有时间戳
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: this.chartData.map((data) => data.value), // 假设每个数据项有值
              type: "line", // 线性图表
            },
          ],
        };
        myChart.setOption(option);
      }
    },
  },
};
</script>

<style scoped>
.simulation-result {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  height: 400px;
  overflow: auto;
}

.variable-info {
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0;
}

.variable-name {
  font-weight: bold;
}

.variable-unit,
.variable-description {
  font-size: 14px;
  color: #555;
}

#chart {
  margin-top: 20px;
  width: 100%;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>
