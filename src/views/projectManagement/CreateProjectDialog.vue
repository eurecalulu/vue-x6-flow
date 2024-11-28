<template>
  <el-dialog
    title="新建项目"
    :visible="isVisible"
    width="30%"
    @close="handleClose"
    class="custom-dialog"
  >
    <el-form
      :model="form"
      label-width="100px"
      :rules="rules"
      ref="form"
      label-position="left"
    >
      <el-form-item label="工程名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入工程名称"></el-input>
      </el-form-item>
      <el-form-item label="绑定网关机" prop="gatewayId">
        <el-input
          v-model="form.gatewayId"
          placeholder="请输入绑定网关机"
        ></el-input>
      </el-form-item>
      <el-form-item label="项目说明" prop="projectDescription">
        <el-input
          type="textarea"
          v-model="form.properties.projectDescription"
          placeholder="请输入项目说明"
          rows="4"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button class="submit-button" @click="submitForm">确定</el-button>
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
    projectData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: "",
        gatewayId: "",
        properties: {
          projectDescription: "", // 默认的 projectDescription 字段
        },
      },
      rules: {
        name: [{ required: true, message: "请输入工程名称", trigger: "blur" }],
        gatewayId: [
          { required: true, message: "请输入绑定网关机", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    projectData: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...newVal,
            properties: {
              ...newVal.properties, // 使用新值或默认空对象
              projectDescription: newVal.properties?.projectDescription || "",
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
        gatewayId: "",
        properties: {
          projectDescription: "", // 重置 projectDescription
        },
      };
    },

    // 提交表单
    async submitForm() {
      await this.$refs.form.validate((valid) => {
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

.custom-dialog ::v-deep .el-dialog {
  border-radius: 5px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
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
