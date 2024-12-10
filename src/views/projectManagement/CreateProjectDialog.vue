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
      <el-form-item label="绑定网关机" prop="name">
        <el-select
          v-model="form.gatewayId"
          placeholder="请选择绑定网关机"
          :filterable="true"
          :clearable="true"
        >
          <el-option
            v-for="gateway in gatewayOptions"
            :key="gateway.id"
            :label="gateway.name"
            :value="gateway.id"
          />
        </el-select>
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
import api from "@/api";

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
      gatewayOptions: [], // 用于存储网关机选项的数据
    };
  },
  created() {
    this.fetchGatewayOptions(); // 在组件加载时获取网关机列表
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
    async fetchGatewayOptions() {
      try {
        const data = {
          currentPage: 1,
          pageSize: null,
          searchKey: null,
        };
        const response = await api.queryGatewayList(data);
        console.log("Response:", response);

        this.gatewayOptions = response.data?.data?.map((gateway) => ({
          id: gateway.id,
          name: gateway.name,
        }));
        console.log("gatewayOptions", this.gatewayOptions);
      } catch (error) {
        console.error("获取网关机列表失败：", error);
      }
    },

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
