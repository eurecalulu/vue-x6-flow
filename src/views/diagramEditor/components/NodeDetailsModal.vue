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
            <h3>节点基础属性</h3>
            <el-form-item label="节点 ID" class="form-item">
              <el-input v-model="localNodeData.id" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item label="节点标签" class="form-item">
              <el-input v-model="localNodeData.name"></el-input>
            </el-form-item>
            <!--            <el-form-item label="填充颜色" class="form-item">-->
            <!--              <el-color-picker-->
            <!--                v-model="localNodeData.fillColor"-->
            <!--              ></el-color-picker>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="线条宽度" size="medium" class="form-item">-->
            <!--              <el-input-number-->
            <!--                v-model="localNodeData.lineWidth"-->
            <!--                :min="1"-->
            <!--                :max="10"-->
            <!--              ></el-input-number>-->
            <!--            </el-form-item>-->
          </div>
          <!-- 业务属性（仅在 type 为 'generator' 时显示） -->
          <div>
            <h3>业务属性</h3>
            <!--            <el-form-item label="参数" class="form-item">-->
            <!--              <el-input-->
            <!--                v-model="localNodeData.parameters"-->
            <!--                placeholder="Parameter Real Un 额定功率"-->
            <!--              ></el-input>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="输入" class="form-item">-->
            <!--              <el-input-->
            <!--                v-model="localNodeData.inputs"-->
            <!--                placeholder="Real P"-->
            <!--              ></el-input>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="输出" class="form-item">-->
            <!--              <el-input-->
            <!--                v-model="localNodeData.outputs"-->
            <!--                placeholder="Real Heat"-->
            <!--              ></el-input>-->
            <!--            </el-form-item>-->
            <!--            <el-form-item label="脚本" class="form-item">-->
            <!--              <el-input-->
            <!--                type="textarea"-->
            <!--                :rows="3"-->
            <!--                v-model="localNodeData.scripts"-->
            <!--                placeholder="der(kWh) = P"-->
            <!--              ></el-input>-->
            <!--            </el-form-item>-->
            <div v-if="category === '处理单元'">
              <el-form-item label="参数" class="form-item">
                <el-input
                  v-model="localNodeData.parameters"
                  placeholder="Parameter Real Un 额定功率"
                ></el-input>
              </el-form-item>
              <el-form-item label="输入" class="form-item">
                <el-input
                  v-model="localNodeData.inputs"
                  placeholder="Real P"
                ></el-input>
              </el-form-item>
              <el-form-item label="输出" class="form-item">
                <el-input
                  v-model="localNodeData.outputs"
                  placeholder="Real Heat"
                ></el-input>
              </el-form-item>
              <el-form-item label="脚本" class="form-item">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="localNodeData.scripts"
                  placeholder="der(kWh) = P"
                ></el-input>
              </el-form-item>
            </div>

            <!-- 如果 category 为 '信号单元' -->
            <div v-else-if="category === '信号单元'">
              <el-form-item label="参数" class="form-item">
                <el-input
                  v-model="localNodeData.parameters"
                  placeholder="Parameter Real DBName '数据库名'"
                ></el-input>
              </el-form-item>
              <el-form-item label="输入" class="form-item">
                <el-input
                  v-model="localNodeData.inputs"
                  placeholder="无"
                ></el-input>
              </el-form-item>
              <el-form-item label="输出" class="form-item">
                <el-input
                  v-model="localNodeData.outputs"
                  placeholder="Real Temperature, Moisture"
                ></el-input>
              </el-form-item>
              <el-form-item label="脚本" class="form-item">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="localNodeData.scripts"
                  placeholder="Select Temperature from S where time=t"
                ></el-input>
              </el-form-item>
            </div>

            <div v-else-if="category === '控制单元'">
              <el-form-item label="参数" class="form-item">
                <el-input
                  v-model="localNodeData.parameters"
                  placeholder="Parameter Real DBName '数据库名'"
                ></el-input>
              </el-form-item>
              <el-form-item label="输入" class="form-item">
                <el-input
                  v-model="localNodeData.inputs"
                  placeholder="无"
                ></el-input>
              </el-form-item>
              <el-form-item label="输出" class="form-item">
                <el-input
                  v-model="localNodeData.outputs"
                  placeholder="Real Temperature,Moisture"
                ></el-input>
              </el-form-item>
              <el-form-item label="信号绑定" class="form-item">
                <el-input
                  type="textarea"
                  :rows="3"
                  v-model="localNodeData.parameters"
                  :placeholder="`设备号：11111
温度信号：temp
XX信号：XXX`"
                ></el-input>
              </el-form-item>
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
      localNodeData: this.nodeData, // 深拷贝，防止修改 props
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
