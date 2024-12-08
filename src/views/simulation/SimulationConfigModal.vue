<template>
  <el-dialog
    title="仿真配置"
    :visible="isVisible"
    width="40%"
    @close="handleClose"
    class="custom-dialog"
  >
    <el-form :model="form" label-width="100px" ref="form" label-position="left">
      <el-form-item label="开始时间" prop="startTime">
        <el-input
          v-model="form.startTime"
          placeholder="请输入开始时间"
        ></el-input>
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-input
          v-model="form.endTime"
          placeholder="请输入结束时间"
        ></el-input>
      </el-form-item>

      <el-form-item label="间隔数量" prop="intervalNum">
        <el-input
          v-model="form.intervalNum"
          placeholder="请输入间隔数量"
        ></el-input>
      </el-form-item>

      <el-form-item label="间隔时间" prop="intervalTime">
        <el-input
          v-model="form.intervalTime"
          placeholder="请输入间隔时间"
        ></el-input>
      </el-form-item>

      <el-form-item label="积分方法" prop="integralMethod">
        <el-input
          v-model="form.integralMethod"
          placeholder="请输入积分方法"
        ></el-input>
      </el-form-item>

      <el-form-item label="积分误差" prop="integralError">
        <el-input
          v-model="form.integralError"
          placeholder="请输入积分误差"
        ></el-input>
      </el-form-item>

      <el-form-item label="雅可比" prop="jacobian">
        <el-input v-model="form.jacobian" placeholder="请输入雅可比"></el-input>
      </el-form-item>

      <el-form-item label="初始步长" prop="initialStepSize">
        <el-input
          v-model="form.initialStepSize"
          placeholder="请输入初始步长"
        ></el-input>
      </el-form-item>

      <el-form-item label="最大步长" prop="maxStepSize">
        <el-input
          v-model="form.maxStepSize"
          placeholder="请输入雅可比"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="close">取消</el-button>
      <el-button class="submit-button" @click="submitForm">开始仿真</el-button>
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
    configData: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        startTime: "",
        endTime: "",
        intervalNum: "",
        intervalTime: "",
        integralMethod: "",
        integralError: "",
        jacobian: "",
        rootSearch: "",
        endReboot: "",
        initialStepSize: "",
        maxStepSize: "",
      },
      // rules: {
      //   name: [{ required: true, message: "请输入工程名称", trigger: "blur" }],
      //   gatewayId: [
      //     { required: true, message: "请输入绑定网关机", trigger: "blur" },
      //   ],
      // },
    };
  },
  watch: {
    configData: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...newVal,
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
        startTime: "",
        endTime: "",
        intervalNum: "",
        intervalTime: "",
        integralMethod: "",
        integralError: "",
        jacobian: "",
        rootSearch: "",
        endReboot: "",
        initialStepSize: "",
        maxStepSize: "",
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
