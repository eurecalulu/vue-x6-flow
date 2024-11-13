<template>
  <div style="padding-top: 100px">
    <el-button type="primary" @click="goDemo(0)"> demo1</el-button>
    <el-button type="primary" @click="goDemo(1)"> demo2</el-button>
    <el-button type="primary" @click="goDemo(2)"> demo3</el-button>
    <el-button type="primary" @click="goDemo(3)"> 工程管理</el-button>
    <el-button type="primary" @click="goDemo(4)"> 模型管理</el-button>
  </div>
</template>

<script>
export default {
  name: "TestCom",
  methods: {
    goDemo(num) {
      const router = [
        "/diagramEditor",
        "/dargeDemo",
        "/demo3",
        "/projectManagement",
        "/modelManagement",
      ];
      this.$router.push(router[num]);
    },
  },
};
</script>
