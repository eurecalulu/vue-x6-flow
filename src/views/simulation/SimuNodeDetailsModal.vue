<template>
  <el-drawer
    :visible="visible"
    direction="rtl"
    size="30%"
    :with-header="false"
    @close="handleClose"
    class="node-details-drawer"
    style="padding: 0 0"
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
            <!--            <h3>参数</h3>-->
            <!--            <el-form-item label="节点 ID" class="form-item">-->
            <!--              <el-tooltip-->
            <!--                :content="'完整ID: ' + localNodeData.id"-->
            <!--                placement="top"-->
            <!--              >-->
            <!--                <el-input-->
            <!--                  v-model="localNodeData.id"-->
            <!--                  :disabled="true"-->
            <!--                ></el-input>-->
            <!--              </el-tooltip>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="节点标签" class="form-item">-->
            <!--              <el-input v-model="localNodeData.name"></el-input>-->
            <!--            </el-form-item>-->

            <div v-if="localNodeData.inputs.length">
              <h3>输入</h3>
              <div v-for="(input, index) in localNodeData.inputs" :key="index">
                <el-form-item :label="input.name" class="form-item">
                  <template v-if="input.otherCategory === '曲线数据'">
                    <el-button
                      class="detail-parameter-custom-button"
                      size="small"
                      icon="el-icon-edit"
                      @click="openCurveDataConfig(index, 'input')"
                    >
                      配置曲线数据
                    </el-button>
                  </template>
                  <template v-else>
                    <!-- 添加 Tooltip，显示完整参数信息 -->
                    <el-tooltip
                      effect="dark"
                      :content="generateTooltipContent(input)"
                      placement="top"
                      :enterable="false"
                    >
                      <el-input
                        v-model="
                          (localNodeData.simuInputs[input.name] || {}).value
                        "
                        placeholder="请填写输入值"
                      ></el-input>
                    </el-tooltip>
                  </template>
                </el-form-item>
              </div>
            </div>

            <div v-if="localNodeData.outputs.length">
              <h3>输出</h3>
              <div
                v-for="(output, index) in localNodeData.outputs"
                :key="index"
              >
                <el-form-item :label="output.name" class="form-item">
                  <template v-if="output.otherCategory === '曲线数据'">
                    <el-button
                      class="detail-parameter-custom-button"
                      size="small"
                      icon="el-icon-edit"
                      @click="openCurveDataConfig(index, 'output')"
                    >
                      配置曲线数据
                    </el-button>
                  </template>
                  <template v-else>
                    <!-- 添加 Tooltip，显示完整参数信息 -->
                    <el-tooltip
                      effect="dark"
                      :content="generateTooltipContent(output)"
                      placement="top"
                      :enterable="false"
                    >
                      <el-input
                        v-model="
                          (localNodeData.simuOutputs[output.name] || {}).value
                        "
                        placeholder="请填写输入值"
                      ></el-input>
                    </el-tooltip>
                  </template>
                </el-form-item>
              </div>
            </div>

            <div v-if="localNodeData.parameters.length">
              <h3>参数</h3>
              <div
                v-for="(parameter, index) in localNodeData.parameters"
                :key="index"
              >
                <el-form-item :label="parameter.name" class="form-item">
                  <template v-if="parameter.otherCategory === '曲线数据'">
                    <el-button
                      class="detail-parameter-custom-button"
                      size="small"
                      icon="el-icon-edit"
                      @click="openCurveDataConfig(index, 'parameter')"
                    >
                      配置曲线数据
                    </el-button>
                  </template>
                  <template v-else>
                    <!-- 添加 Tooltip，显示完整参数信息 -->
                    <el-tooltip
                      effect="dark"
                      :content="generateTooltipContent(parameter)"
                      placement="top"
                      :enterable="false"
                    >
                      <el-input
                        v-model="
                          (localNodeData.simuParameters[parameter.name] || {})
                            .value
                        "
                        placeholder="请填写输入值"
                      ></el-input>
                    </el-tooltip>
                  </template>
                </el-form-item>
              </div>
            </div>
          </div>

          <div>
            <h3>仿真参数</h3>
            <div v-if="category === '处理单元' || category === '全局单元'">
              <el-form-item label="采样数据最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.simpleDataMinInterval"
                  placeholder=""
                ></el-input>
              </el-form-item>
              <el-form-item label="控制指令响应最小间隔" class="form-item">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="localNodeData.controllerRespMinInterval"
                  placeholder=""
                ></el-input>
              </el-form-item>
            </div>

            <!-- 如果 category 为 '信号单元' -->
            <div v-else-if="category === '信号单元'">
              <el-form-item label="控制最小时间间隔" class="form-item">
                <el-input
                  v-model="localNodeData.controllerOrderMinInterval"
                  placeholder=""
                ></el-input>
              </el-form-item>
            </div>

            <div v-else-if="category === '控制单元'">
              <el-form-item label="控制指令最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.controllerOrderMinInterval"
                ></el-input>
              </el-form-item>
              <el-form-item label="采样数据最小间隔" class="form-item">
                <el-input
                  v-model="localNodeData.simpleDataMinInterval"
                ></el-input>
              </el-form-item>
            </div>

            <div
              v-if="
                category === '处理单元' ||
                category === '信号单元' ||
                category === '控制单元' ||
                category === '全局单元'
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
    <!-- 曲线数据弹窗 -->
    <curve-data-config
      :visible="isCurveDataConfigVisible"
      :parameter="currentCurveParameter || {}"
      @update-curve-data="updateCurveData"
      @update:visible="isCurveDataConfigVisible = $event"
    />
  </el-drawer>
</template>

<script>
import SignalBindConfig from "./SignalBindConfig.vue";
import CurveDataConfig from "./CurveDataConfig.vue";

export default {
  name: "SimuNodeDetailsModal",
  components: {
    SignalBindConfig,
    CurveDataConfig,
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
      isCurveDataConfigVisible: false, // 控制曲线数据弹窗显示
      currentCurveParameter: null, // 当前选中的曲线参数
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
      immediate: true,
      handler(newVal) {
        this.localNodeData = newVal; // 当 props 发生变化时，更新局部数据
        this.initializeSimuData();
      },
    },
  },
  methods: {
    initializeSimuData() {
      // 遍历 inputs 初始化 simuInputs
      this.localNodeData.inputs.forEach((input) => {
        if (!this.localNodeData.simuInputs[input.name]) {
          this.$set(this.localNodeData.simuInputs, input.name, { value: "" });
        }
      });

      // 遍历 outputs 初始化 simuOutputs
      this.localNodeData.outputs.forEach((output) => {
        if (!this.localNodeData.simuOutputs[output.name]) {
          this.$set(this.localNodeData.simuOutputs, output.name, { value: "" });
        }
      });

      // 遍历 parameters 初始化 simuParameters
      this.localNodeData.parameters.forEach((parameter) => {
        if (!this.localNodeData.simuParameters[parameter.name]) {
          this.$set(this.localNodeData.simuParameters, parameter.name, {
            value: "",
          });
        }
      });
    },
    generateTooltipContent(item) {
      return `
      名称: ${item.name || "无"} \n
      参数名称: ${item.variableName || "无"} \n
      量纲: ${item.unit || "无"} \n
      缺省值: ${item.defaultValue || "无"} \n
      参数类别: ${item.parameterCategory || "无"} \n
      其他类别: ${item.otherCategory || "无"} \n
      取值上限: ${item.upperLimit || "无"} \n
      取值下限: ${item.lowerLimit || "无"} \n
      帮助内容: ${item.description || "无"}
    `;
    },
    handleClose() {
      this.$emit("update:visible", false);
    },
    handleSubmit() {
      // 处理 inputs
      this.localNodeData.inputs.forEach((input) => {
        if (!this.localNodeData.simuInputs[input.name]) {
          this.localNodeData.simuInputs[input.name] = {};
        }
        this.localNodeData.simuInputs[input.name] = {
          ...input, // 存入所有字段
          value: this.localNodeData.simuInputs[input.name].value || "", // 添加用户填写的值
        };
      });

      // 处理 outputs
      this.localNodeData.outputs.forEach((output) => {
        if (!this.localNodeData.simuOutputs[output.name]) {
          this.localNodeData.simuOutputs[output.name] = {};
        }
        this.localNodeData.simuOutputs[output.name] = {
          ...output,
          value: this.localNodeData.simuOutputs[output.name].value || "",
        };
      });

      // 处理 parameters
      this.localNodeData.parameters.forEach((parameter) => {
        if (!this.localNodeData.simuParameters[parameter.name]) {
          this.localNodeData.simuParameters[parameter.name] = {};
        }
        this.localNodeData.simuParameters[parameter.name] = {
          ...parameter,
          value: this.localNodeData.simuParameters[parameter.name].value || "",
        };
      });

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
    openCurveDataConfig(index, type) {
      let target = null;

      // 先找存储的曲线数据，没有再找输入项中的原始数据
      if (type === "input") {
        target =
          this.localNodeData.simuInputs[
            this.localNodeData.inputs[index].name
          ] || this.localNodeData.inputs[index];
      } else if (type === "output") {
        target =
          this.localNodeData.simuOutputs[
            this.localNodeData.outputs[index].name
          ] || this.localNodeData.outputs[index];
      } else {
        target =
          this.localNodeData.simuParameters[
            this.localNodeData.parameters[index].name
          ] || this.localNodeData.parameters[index];
      }

      // 确保是曲线数据类型
      if (target.otherCategory === "曲线数据") {
        this.currentCurveParameter = {
          ...target,
          category: type,
        };

        // 确保 value 存在，如果不存在则初始化为空数组
        if (!Array.isArray(this.currentCurveParameter.value)) {
          this.$set(this.currentCurveParameter, "value", []);
        }

        this.isCurveDataConfigVisible = true;
      }
    },

    updateCurveData(newCurveParameter) {
      if (this.currentCurveParameter) {
        const { name, category } = this.currentCurveParameter;

        const target =
          category === "input"
            ? this.localNodeData.simuInputs
            : category === "output"
            ? this.localNodeData.simuOutputs
            : this.localNodeData.simuParameters;

        if (!target[name]) {
          this.$set(target, name, { value: [] });
        }

        // 直接更新整个对象，保留原始字段和曲线值
        target[name] = {
          ...this.currentCurveParameter,
          value: newCurveParameter,
        };
      }
    },
  },
};
</script>

<style scoped>
.node-details-drawer {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
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
