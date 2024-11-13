<!--&lt;!&ndash; NodeDetailsModal.vue &ndash;&gt;-->
<!--<template>-->
<!--  <el-drawer-->
<!--    :visible="visible"-->
<!--    title="节点详情"-->
<!--    direction="rtl"-->
<!--    size="30%"-->
<!--    :with-header="true"-->
<!--    custom-class="node-details-drawer"-->
<!--    @close="handleClose"-->
<!--  >-->
<!--    &lt;!&ndash; 显示节点基础属性 &ndash;&gt;-->
<!--    <div v-if="localNodeData">-->
<!--      <h3>节点基础属性</h3>-->
<!--      <p>节点 ID：{{ localNodeData.id }}</p>-->
<!--      <p>节点标签：{{ localNodeData.label }}</p>-->

<!--      &lt;!&ndash; 填充颜色和线条宽度（根据原型图） &ndash;&gt;-->
<!--      <div>-->
<!--        <label>填充颜色</label>-->
<!--        <el-color-picker v-model="localNodeData.fillColor"></el-color-picker>-->
<!--      </div>-->
<!--      <div>-->
<!--        <label>线条宽度</label>-->
<!--        <el-input-number-->
<!--          v-model="localNodeData.lineWidth"-->
<!--          :min="1"-->
<!--          :max="10"-->
<!--        ></el-input-number>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; 如果节点类型是"generator"，显示业务属性 &ndash;&gt;-->
<!--    &lt;!&ndash;    <div v-if="localNodeData.type === 'generator'">&ndash;&gt;-->
<!--    <div>-->
<!--      <h3>业务属性</h3>-->

<!--      &lt;!&ndash; 参数部分 &ndash;&gt;-->
<!--      <div>-->
<!--        <label>参数</label>-->
<!--        <p>Parameter Real Un "{{ localNodeData.parameterName }}"</p>-->
<!--      </div>-->

<!--      &lt;!&ndash; 输入字段 &ndash;&gt;-->
<!--      <div>-->
<!--        <label>输入</label>-->
<!--        <el-input v-model="localNodeData.input" placeholder="Real P"></el-input>-->
<!--      </div>-->

<!--      &lt;!&ndash; 输出字段 &ndash;&gt;-->
<!--      <div>-->
<!--        <label>输出</label>-->
<!--        <el-input-->
<!--          v-model="localNodeData.output"-->
<!--          placeholder="Real Heat"-->
<!--        ></el-input>-->
<!--      </div>-->

<!--      &lt;!&ndash; 脚本字段 &ndash;&gt;-->
<!--      <div>-->
<!--        <label>脚本</label>-->
<!--        <el-input-->
<!--          v-model="localNodeData.script"-->
<!--          placeholder="der(kWh) = P"-->
<!--        ></el-input>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; 可以根据需要添加其他节点类型的显示内容 &ndash;&gt;-->
<!--  </el-drawer>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  name: "NodeDetailsModal",-->
<!--  props: {-->
<!--    visible: {-->
<!--      type: Boolean,-->
<!--      required: true,-->
<!--    },-->
<!--    nodeData: {-->
<!--      type: Object,-->
<!--      default: () => ({}),-->
<!--    },-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      localNodeData: JSON.parse(JSON.stringify(this.nodeData)), // 深拷贝，防止修改 props-->
<!--    };-->
<!--  },-->
<!--  watch: {-->
<!--    nodeData: {-->
<!--      deep: true,-->
<!--      handler(newVal) {-->
<!--        this.localNodeData = JSON.parse(JSON.stringify(newVal)); // 当 props 发生变化时，更新局部数据-->
<!--      },-->
<!--    },-->
<!--  },-->
<!--  methods: {-->
<!--    handleClose() {-->
<!--      this.$emit("update:visible", false);-->
<!--    },-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--.node-details-drawer {-->
<!--  /* 自定义抽屉样式 */-->
<!--}-->
<!--</style>-->

<!-- NodeDetailsModal.vue -->
<template>
  <el-drawer
    :visible="visible"
    title="节点详情"
    direction="rtl"
    size="30%"
    :with-header="true"
    custom-class="node-details-drawer"
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
  /* 自定义抽屉样式 */
}
</style>
