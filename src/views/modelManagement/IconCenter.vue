<template>
  <el-dialog
    title="图标中心"
    :visible.sync="localVisible"
    width="50%"
    class="icon-center-dialog"
    :modal="false"
    @closed="handleDialogClose"
  >
    <div class="icon-list" :class="{ 'few-icons': icons.length <= 3 }">
      <div v-for="icon in icons" :key="icon.id" class="icon-item">
        <img
          v-if="icon.url"
          :src="icon.url"
          :alt="icon.name"
          @click="selectIcon(icon.id)"
          class="icon-image"
        />
        <p>{{ icon.name }}</p>
        <el-button
          class="low-danger"
          size="mini"
          icon="el-icon-delete"
          @click.stop="deleteIcon(icon.id)"
        >
          删除
        </el-button>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-upload
        class="upload-icon"
        action="https://example.com/dummy-upload"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
      >
        <el-button type="primary" class="upload-icon-button"
          >上传图标</el-button
        >
      </el-upload>
      <el-button @click="close">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import api from "@/api"; // 导入 API 模块
export default {
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      localVisible: this.visible, // 本地状态
      icons: [
        // { id: 1, name: "图标1", url: "https://i.imgur.com/or1EZsz.jpg" },
        // { id: 2, name: "图标2", url: "https://i.imgur.com/4xBTxfw.jpg" },
        // 添加更多图标
      ],
    };
  },
  watch: {
    visible(newVal) {
      this.localVisible = newVal;
      if (newVal) {
        this.fetchIcons(); // 弹窗打开时获取图标列表
      }
    },
    localVisible(newVal) {
      this.$emit("update:visible", newVal);
    },
  },
  methods: {
    close() {
      this.localVisible = false;
      this.$emit("close"); // 直接通知父组件关闭弹窗
    },
    selectIcon(iconId) {
      this.$emit("icon-selected", iconId); // 通知父组件选择图标
      this.$emit("close"); // 同时关闭弹窗
    },
    async fetchIcons() {
      try {
        const response = await api.queryIconList();
        if (response && response.data) {
          this.icons = response.data.data.map((icon) => ({
            id: icon.id,
            name: icon.name,
            url: icon.data, // 后端返回的 Base64 数据作为图片 URL
          }));
        }
      } catch (error) {
        console.error("获取图标列表失败：", error);
      }
    },
    async deleteIcon(iconId) {
      try {
        await api.deleteIcon(iconId);
        this.icons = this.icons.filter((icon) => icon.id !== iconId);
        this.$message.success("图标删除成功");
      } catch (error) {
        console.error("删除图标失败：", error);
        this.$message.error("图标删除失败");
      }
    },
    async handleBeforeUpload(file) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Data = reader.result; // 转换为 Base64 数据
          const iconName = file.name.split(".")[0]; // 使用文件名作为图标名称

          // 调用添加图标接口
          const response = await api.addIcon({
            name: iconName,
            data: base64Data,
            properties: {}, // 可根据需求扩展
          });

          if (response && response.data) {
            this.icons.push({
              id: response.data.id,
              name: iconName,
              url: base64Data,
            });
            this.$message.success("图标上传成功");
          }
          await this.fetchIcons();
        };
      } catch (error) {
        console.error("上传图标失败：", error);
        this.$message.error("图标上传失败");
      }

      return false; // 阻止默认上传行为
    },
    handleUploadSuccess(response) {
      console.log("上传成功：", response);
    },
    handleDialogClose() {
      this.$emit("close");
    },
    // handleUploadSuccess(response) {
    //   // 假设返回的response中有新上传的icon信息
    //   const newIcon = {
    //     id: response.id,
    //     name: response.name,
    //     url: response.url,
    //   };
    //   this.icons.push(newIcon);
    // },
    // handleDialogClose() {
    //   // 当 el-dialog 关闭时，确保通知父组件关闭状态
    //   this.$emit("close");
    // },
  },
};
</script>

<style>
.icon-center-dialog .icon-list {
  display: flex;
  flex-wrap: wrap; /* 让图标换行 */
  gap: 24px 16px; /* 行间距为24px，列间距为16px */
  justify-content: flex-start; /* 默认左对齐 */
  max-height: 300px; /* 限制高度，增加滚动条 */
  overflow-y: auto; /* 当图标超出容器时添加滚动条 */
  padding: 16px;
}

.icon-center-dialog .icon-item {
  flex: 0 0 calc(20% - 16px); /* 每行显示 5 个图标，自动调整宽度 */
  text-align: center;
  cursor: pointer;
  box-sizing: border-box; /* 包括内边距和边框宽度 */
}

.icon-center-dialog .icon-list.few-icons {
  justify-content: flex-start; /* 图标较少时左对齐 */
}

.icon-center-dialog .icon-item img {
  width: 50px; /* 图标大小 */
  height: 50px;
  object-fit: cover;
  margin-bottom: 8px;
  //border: 1px solid #ddd; /* 边框 */
  //border-radius: 4px; /* 圆角 */
  transition: transform 0.2s; /* 鼠标悬浮放大效果 */
}

.icon-center-dialog .icon-item img:hover {
  transform: scale(1.1); /* 鼠标悬浮放大 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* 按钮靠右排列 */
  align-items: center; /* 垂直方向居中 */
  gap: 10px; /* 按钮之间的间距 */
}

.icon-center-dialog {
  z-index: 3000 !important; /* 确保比父弹窗高 */
}
.upload-icon-button {
  background-color: #4a4a4a !important; /* 按钮背景颜色 */
  color: #ffffff !important; /* 按钮文字颜色 */
  border: none !important; /* 移除边框 */
}

.upload-icon-button:hover {
  background-color: #3a3a3a !important; /* 悬停时的背景颜色 */
}
.low-danger {
  color: #8b0000 !important; /* 文字颜色 */
  border: 1px solid #8b0000 !important; /* 边框颜色 */
  background-color: #fff !important; /* 背景颜色为白色 */
  padding: 4px 12px; /* 增加内边距 */
  transition: all 0.3s ease; /* 增加平滑过渡 */
}

.low-danger:hover {
  color: #b22222 !important; /* 鼠标悬停时稍深的红色 */
  border-color: #b22222 !important; /* 悬停时边框颜色 */
  background-color: #fce4e4 !important; /* 悬停时背景略微泛红 */
  transform: scale(1.05); /* 鼠标悬停时轻微放大 */
}
</style>
