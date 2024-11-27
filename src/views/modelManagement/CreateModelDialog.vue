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
          <el-option label="处理单元" value="处理单元"></el-option>
          <el-option label="信号单元" value="信号单元"></el-option>
          <el-option label="控制单元" value="控制单元"></el-option>
        </el-select>
      </el-form-item>
      <!--      <el-form-item label="图标" prop="iconId">-->
      <!--        <el-input v-model="form.iconId" placeholder="请输入图标"></el-input>-->
      <!--      </el-form-item>-->
      <el-form-item label="图标" prop="iconId">
        <div class="icon-select-container">
          <el-button
            type="primary"
            class="select-icon-button"
            @click="openIconCenter"
          >
            选择图标
          </el-button>
          <div v-if="form.iconId" class="icon-preview">
            <img :src="selectedIcon.url" alt="已选图标" class="selected-icon" />
            <span class="icon-name">{{ selectedIcon.name }}</span>
          </div>
        </div>
      </el-form-item>
      <!--      <el-form-item label="图标" prop="iconId">-->
      <!--        <el-button type="primary" @click="openIconCenter"> 选择图标 </el-button>-->
      <!--        <div v-if="form.iconId" class="icon-preview">-->
      <!--          <img :src="selectedIcon.url" alt="已选图标" class="selected-icon" />-->
      <!--          <span>{{ selectedIcon.name }}</span>-->
      <!--        </div>-->
      <!--      </el-form-item>-->
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
    <IconCenter
      :visible="iconCenterVisible"
      @close="closeIconCenter"
      @icon-selected="selectIcon"
    />
  </el-dialog>
</template>

<script>
import api from "@/api"; // 导入 API 模块
import IconCenter from "./IconCenter.vue";
export default {
  components: {
    IconCenter,
  },
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
      selectedIcon: {
        url: "", // 选中的图标 URL
        name: "", // 选中的图标名称
      },
      iconCenterVisible: false, // 图标中心弹窗可见性
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
          // 如果存在 iconId，调用接口获取图标详情
          if (newVal.iconId) {
            this.fetchIconDetails(newVal.iconId);
          }
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
    openIconCenter() {
      this.iconCenterVisible = true; // 打开图标中心
    },
    closeIconCenter() {
      this.iconCenterVisible = false; // 关闭图标中心
    },
    selectIcon(iconId) {
      this.form.iconId = iconId; // 设置选中的图标ID
      this.fetchIconDetails(iconId); // 获取图标详情以显示预览
      this.closeIconCenter();
    },
    async fetchIconDetails(iconId) {
      try {
        const response = await api.queryIcon(iconId);
        if (response && response.data) {
          this.selectedIcon = {
            url: response.data.data.data, // 图标的 URL
            name: response.data.data.name, // 图标的名称
          };
        }
      } catch (error) {
        console.error("获取图标详情失败：", error);
        this.selectedIcon = { url: "", name: "" };
      }
    },
  },
};
</script>

<style scoped>
/* 自定义弹窗样式 */
.icon-select-container {
  display: flex;
  align-items: center;
  gap: 20%; /* 按钮和图标之间的间距 */
}
.custom-dialog ::v-deep .el-dialog {
  border-radius: 5px !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
}

/* 表单字段间距 */
.el-form-item {
  margin-bottom: 16px;
}

.selected-icon {
  width: 30px; /* 缩略图宽度 */
  height: 30px; /* 缩略图高度 */
  object-fit: cover;
  //border: 1px solid #ddd;
  //border-radius: 4px;
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
.icon-preview {
  display: flex;
  align-items: center;
  gap: 8px; /* 调整图标和名称之间的间距 */
}
.select-icon-button {
  background-color: #4a4a4a !important; /* 按钮背景颜色 */
  color: #ffffff !important; /* 按钮文字颜色 */
  border: none !important; /* 移除边框 */
}

.select-icon-button:hover {
  background-color: #3a3a3a !important; /* 悬停时的背景颜色 */
}
</style>
