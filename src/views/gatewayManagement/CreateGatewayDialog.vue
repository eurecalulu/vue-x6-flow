<template>
  <el-dialog
    title="添加网关机"
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
      <el-form-item label="网关机名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入网关机名称"></el-input>
      </el-form-item>
      <el-form-item label="网关机IP" prop="name">
        <el-input
          v-model="form.ipAddress"
          placeholder="请输入网关机IP"
        ></el-input>
      </el-form-item>
      <el-form-item label="网关机端口" prop="name">
        <el-input v-model="form.port" placeholder="请输入网关机端口"></el-input>
      </el-form-item>
      <el-form-item label="网关机状态" prop="modelType">
        <el-select
          v-model="form.communicationStatus"
          placeholder="请选择网关机状态"
          style="width: 100%"
        >
          <el-option label="健康" :value="true"></el-option>
          <el-option label="下线" :value="false"></el-option>
        </el-select>
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
    gatewayData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        name: "",
        ipAddress: "",
        port: 0,
        communicationStatus: true,
        properties: {},
      },
      rules: {
        name: [
          { required: true, message: "请输入网关机名称", trigger: "blur" },
        ],
        ipAddress: [
          { required: true, message: "请输入网关机IP地址", trigger: "blur" },
        ],
        port: [
          { required1: true, message: "请输入网关机端口", trigger: "blur" },
        ],
        communicationStatus: [
          { required: true, message: "请输入选择网关机状态", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    gatewayData: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...this.form, // 保留默认值
            ...newVal, // 覆盖传入值
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
        ipAddress: "",
        port: 0,
        communicationStatus: true,
        properties: {},
      };
    },

    // 提交表单
    async submitForm() {
      await this.$refs.form.validate((valid) => {
        if (valid) {
          const submitData = {
            ...this.form,
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
