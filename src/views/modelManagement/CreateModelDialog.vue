<template>
  <el-dialog
    title="新建模型"
    :visible="isVisible"
    width="30%"
    @close="handleClose"
    class="custom-dialog"
  >
    <el-form
      :model="form"
      label-width="80px"
      :rules="rules"
      ref="form"
      label-position="left"
    >
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入模型名称"></el-input>
      </el-form-item>
      <el-form-item label="目录" prop="categoryId">
        <el-input v-model="form.categoryId" placeholder="请输入目录"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择类型"
          style="width: 100%"
        >
          <el-option label="处理单元" value="处理单元t"></el-option>
          <el-option label="信号单元" value="信号单元"></el-option>
          <el-option label="控制单元" value="控制单元"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="图标" prop="iconId">
        <el-input v-model="form.iconId" placeholder="请输入图标"></el-input>
      </el-form-item>
      <!--
      <el-form-item label="模型" prop="modelOption">
        <el-select v-model="form.modelOption" placeholder="可选" size="medium">
          <el-option label="可选" value="optional"></el-option>
          <el-option label="必选" value="mandatory"></el-option>
        </el-select>
      </el-form-item>
      -->
      <el-form-item label="模型描述" prop="modelDescription">
        <el-input
          type="textarea"
          v-model="form.properties.modelDescription"
          placeholder="请输入模型描述"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" class="submit-button" @click="submitForm">
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true,
    },
    modelData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: "",
        categoryId: "",
        type: "",
        iconId: "",
        modelOption: "",
        properties: {
          modelDescription: "", // 默认的 modelDescription 字段
        },
      },
      rules: {
        name: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
        categoryId: [
          { required: true, message: "请输入目录", trigger: "blur" },
        ],
        type: [{ required: true, message: "请选择类型", trigger: "change" }],
        iconId: [{ required: true, message: "请输入图标", trigger: "blur" }],
      },
    };
  },
  watch: {
    modelData: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...newVal,
            properties: {
              ...newVal.properties, // 使用新值或默认空对象
              modelDescription: newVal.properties?.modelDescription || "",
            },
          };
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleClose() {
      this.resetForm();
      this.$emit("close");
    },
    resetForm() {
      this.form = {
        name: "",
        categoryId: "",
        type: "",
        iconId: "",
        modelOption: "",
        properties: {
          modelDescription: "", // 重置 modelDescription
        },
      };
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const submitData = {
            ...this.form,
            properties: {
              ...this.form.properties,
            },
          };
          this.$emit("submit", submitData);
          this.close();
        } else {
          console.log("表单验证失败");
        }
      });
    },
    close() {
      this.$emit("close", false);
      this.resetForm();
    },
  },
};
</script>

<style scoped>
/* 自定义弹窗样式 */
.custom-dialog ::v-deep .el-dialog {
  border-radius: 5px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* 表单字段间距 */
.el-form-item {
  margin-bottom: 16px;
}

/* 标签颜色和必填项星号 */
.el-form-item__label {
  color: #333333;
  font-weight: bold;
}
.el-form-item__label .is-required::after {
  content: " *";
  color: #d9534f;
}

/* 按钮样式 */
.dialog-footer .el-button {
  border-radius: 4px;
}
.dialog-footer .submit-button {
  background-color: #4a4a4a;
  border: none;
  color: #fff;
}
.dialog-footer .submit-button:hover {
  background-color: #3a3a3a;
}
</style>
