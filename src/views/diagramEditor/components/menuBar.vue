<template>
  <el-card
    class="box-card"
    :style="{ left: x + 'px', top: y + 'px' }"
    :stop="11"
    @click.stop=""
    style="padding: 0"
  >
    <div class="text item" @click.stop="callBack('remove')">删除</div>
  </el-card>
</template>

<script>
export default {
  name: "MenuBar",
  data() {
    return {
      x: "",
      y: "",
      item: {},
    };
  },
  computed: {
    menuStyle() {
      return {
        left: `${this.x}px`,
        top: `${this.y}px`,
        padding: "0",
        position: "fixed", // 使用 fixed 以相对于视口定位
        zIndex: 1000, // 确保菜单在最上层
      };
    },
  },
  mounted() {},
  methods: {
    initFn(x, y, item) {
      console.log(x, y);
      // 不需要转换坐标，直接使用 x, y 作为绝对坐标
      this.x = x;
      this.y = y;

      // 如果有 item，更新 item 数据
      if (item) {
        this.item = item;
      }
    },
    setItem(item) {
      this.item = item;
    },
    callBack(type) {
      this.$emit("callBack", type, this.item);
    },
  },
};
</script>
<style scoped>
.box-card {
  position: absolute; /* 确保绝对定位 */
  z-index: 1000; /* 确保在最上层 */
}

.box-card ::v-deep .el-card__body {
  padding: 0;
}

.text {
  font-size: 14px;
}

.item {
  padding: 10px 0;
  text-align: center;
}

.item:hover {
  color: #ffffff;
  background-color: #409eff;
}

.box-card {
  width: 150px;
}
</style>
