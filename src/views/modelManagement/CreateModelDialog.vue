<template>
  <el-dialog
    title="增加模型"
    :visible="isVisible"
    width="400px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="80px" :rules="rules" ref="form">
      <el-form-item label="模型名称" prop="name">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="目录" prop="directory">
        <el-input v-model="form.directory"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input v-model="form.type"></el-input>
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="form.icon"></el-input>
      </el-form-item>
      <el-form-item label="模型" prop="modelOption">
        <el-select v-model="form.modelOption" placeholder="可选">
          <el-option label="可选" value="optional"></el-option>
          <el-option label="必选" value="mandatory"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="模型描述" prop="modelDescription">
        <el-input
          type="textarea"
          v-model="form.properties.modelDescription"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
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
        directory: "",
        type: "",
        icon: "",
        modelOption: "",
        properties: {
          modelDescription: "", // 默认的 modelDescription 字段
        },
      },
      rules: {
        name: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
        directory: [{ required: true, message: "请输入目录", trigger: "blur" }],
        type: [{ required: true, message: "请输入类型", trigger: "blur" }],
        icon: [{ required: true, message: "请输入图标", trigger: "blur" }],
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
        directory: "",
        type: "",
        icon: "",
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
