<template>
  <el-dialog
    v-dialog-drag
    :visible.sync="localVisible"
    :title="dialogTitle"
    width="96%"
    :modal="false"
    class="custom-inner-modal"
    @close="handleClose"
  >
    <el-table
      :data="localParameters"
      style="width: 100%"
      border
      :header-cell-style="{ background: '#f5f7fa' }"
    >
      <el-table-column prop="variableName" label="参数名称">
        <template #default="scope">
          <el-input
            v-model="scope.row.variableName"
            placeholder="参数名称"
            size="mini"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="unit" label="量纲">
        <template #default="scope">
          <el-input
            v-model="scope.row.unit"
            placeholder="量纲"
            size="mini"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="defaultValue" label="缺省值">
        <template #default="scope">
          <el-input
            v-model="scope.row.defaultValue"
            placeholder="缺省值"
            size="mini"
          ></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="parameterCategory" label="参数类别">
        <template #default="scope">
          <el-select
            v-model="scope.row.parameterCategory"
            placeholder="选择类别"
            size="mini"
          >
            <el-option label="浮点数" value="浮点数"></el-option>
            <el-option label="整数" value="整数"></el-option>
            <el-option label="枚举量" value="枚举量"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="otherCategory" label="其他类别">
        <template #default="scope">
          <el-select
            v-model="scope.row.otherCategory"
            placeholder="选择类别"
            size="mini"
          >
            <el-option label="无" value="无"></el-option>
            <el-option label="外部信号" value="外部信号"></el-option>
            <el-option label="曲线数据" value="曲线数据"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="upperLimit" label="取值上限">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.upperLimit"
            placeholder="无"
            style="width: 90%"
            size="mini"
          ></el-input-number>
        </template>
      </el-table-column>

      <el-table-column prop="lowerLimit" label="取值下限">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.lowerLimit"
            placeholder="无"
            style="width: 90%"
            size="mini"
          ></el-input-number>
        </template>
      </el-table-column>

      <el-table-column prop="description" label="帮助内容">
        <template #default="scope">
          <el-input
            v-model="scope.row.description"
            placeholder="帮助内容"
            style="width: 90%"
            size="mini"
          ></el-input>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="80">
        <template #default="scope">
          <el-button
            class="parameter-low-danger"
            size="medium"
            @click="removeParameter(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button
      class="parameter-custom-button"
      icon="el-icon-plus"
      style="margin-top: 10px"
      @click="addParameter"
      size="medium"
    >
      新增参数
    </el-button>

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
  name: "ParameterConfigModal",
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    parameters: {
      type: Array,
      default: () => [],
    },
    type: {
      // 用于区分是输入参数还是输出参数
      type: String,
      required: true,
    },
  },
  data() {
    return {
      localVisible: this.visible, // 本地状态，用于控制弹窗显示
      localParameters: JSON.parse(JSON.stringify(this.parameters)), // 深拷贝参数
    };
  },
  computed: {
    dialogTitle() {
      // 根据类型动态设置标题
      return this.type === "input"
        ? "输入参数配置"
        : this.type === "output"
        ? "输出参数配置"
        : this.type === "parameter"
        ? "参数配置"
        : ""; // 如果没有匹配的类型，返回空字符串
    },
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // 当弹窗打开时，初始化 localParameters
        this.localParameters = JSON.parse(JSON.stringify(this.parameters));
      }
      this.localVisible = newVal;
    },
    localVisible(newVal) {
      // 当本地状态变化时，通知父组件
      this.$emit("update:visible", newVal);
    },
    parameters: {
      deep: true,
      handler(newVal) {
        // 父组件参数变化时，更新本地数据
        this.localParameters = JSON.parse(JSON.stringify(newVal));
      },
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    handleConfirm() {
      this.$emit("update", this.localParameters);
      this.handleClose();
    },
    addParameter() {
      this.localParameters.push({
        name: "",
        unit: "",
        defaultValue: null,
        parameterCategory: "浮点数",
        otherCategory: "无",
        upperLimit: null,
        lowerLimit: null,
        description: "",
      });
    },
    removeParameter(index) {
      if (index >= 0 && index < this.localParameters.length) {
        this.localParameters.splice(index, 1);
      } else {
        console.warn("Invalid index:", index);
      }
    },
  },
};
</script>

<style scoped>
.parameter-custom-button {
  background-color: #4a4a4a !important; /* 按钮背景颜色 */
  color: #ffffff !important; /* 按钮文字颜色 */
  border: none !important; /* 移除边框 */
}
.parameter-custom-button:hover {
  background-color: #3a3a3a !important; /* 悬停时的背景颜色 */
}
.custom-inner-modal {
  z-index: 3000 !important; /* 提高内层弹窗的层级 */
}

.dialog-footer {
  text-align: right;
}

.parameter-low-danger {
  color: #8b0000 !important; /* 文字颜色 */
  border: 1px solid #8b0000 !important; /* 边框颜色 */
  background-color: #fff !important; /* 背景颜色为白色 */
  padding: 4px 12px; /* 增加内边距 */
  transition: all 0.3s ease; /* 增加平滑过渡 */
}

.parameter-low-danger:hover {
  color: #b22222 !important; /* 鼠标悬停时稍深的红色 */
  border-color: #b22222 !important; /* 悬停时边框颜色 */
  background-color: #fce4e4 !important; /* 悬停时背景略微泛红 */
  transform: scale(1.05); /* 鼠标悬停时轻微放大 */
}
</style>
