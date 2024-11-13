<template>
  <div class="node">
    <img :src="imgCot.logo" class="node-image" alt="generator" />
    <span class="label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: "GeneratorNode",

  inject: ["getGraph", "getNode"],

  data() {
    return {
      label: "", // 节点的标签
      imgCot: {
        logo: "https://imgur.com/4xBTxfw.jpg", // 替换成你找到的生成器图片 URL
      },
    };
  },

  mounted() {
    const node = this.getNode();
    this.label = node.data.label; // 从节点数据中初始化标签

    // 监听数据变化，实时更新标签
    node.on("change:data", ({ current }) => {
      this.label = current.label;
    });
  },
};
</script>

<style scoped>
.node {
  position: relative;
  width: 100px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; /* 让图片和标签垂直排列 */
  //border-radius: 50%; /* 如果你想要圆形的节点 */
  border-radius: 10%; /* 如果你想要圆形的节点 */
  overflow: hidden;
}

.node-image {
  width: 80%;
  //height: 80%;
  object-fit: cover; /* 保持图片比例 */
  //border-radius: 50%; /* 图片变为圆形 */
}

.label {
  margin-top: 5px; /* 添加间距 */
  //position: absolute;
  //top: 50%;
  //left: 50%;
  //transform: translate(-50%, -50%);
  color: black;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
}
</style>
