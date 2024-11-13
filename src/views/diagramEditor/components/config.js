const config = [
  // {
  //   type: "output",
  //   label: "只允许输出",
  //   name: "输出",
  //   data: {
  //     name: "输出",
  //   },
  // },
  //
  // {
  //   type: "database",
  //   label: "数据库",
  //   name: "mySql",
  //   data: {
  //     name: "mysql",
  //   },
  // },
  // {
  //   type: "onlyIn",
  //   label: "只允许输入",
  //   name: "只允许输入",
  //   data: {
  //     name: "只允许输入",
  //   },
  // },
  // {
  //   type: "condition",
  //   label: "条件",
  //   name: "条件",
  //   data: {
  //     name: "condition",
  //     t: "",
  //     f: "",
  //   },
  // },
  {
    type: "generatorNode",
    label: "生成器",
    name: "生成器",
    data: {
      name: "generatorNode",
      t: "",
      f: "",
    },
  },
  {
    type: "airConditionerNode",
    label: "空调",
    name: "空调",
    data: {
      name: "airConditionerNode",
      t: "",
      f: "",
    },
  },
  {
    type: "controllerNode",
    label: "控制器",
    name: "控制器",
    data: {
      name: "controllerNode",
      t: "",
      f: "",
    },
  },
  {
    type: "otherLoad",
    label: "其他负荷",
    name: "其他负荷",
    data: {
      name: "otherLoad",
      t: "",
      f: "",
    },
  },
  {
    type: "pvNode",
    label: "光伏",
    name: "光伏",
    data: {
      name: "pvNode",
      t: "",
      f: "",
    },
  },
  {
    type: "roomTempNode",
    label: "室温",
    name: "室温",
    data: {
      name: "roomTempNode",
      t: "",
      f: "",
    },
  },
];

export default config;
