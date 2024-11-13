<template>
  <el-container style="height: 100vh; background-color: #f5f5f5">
    <!-- 顶部标题栏 -->
    <el-header
      style="
        background-color: #fdfdfd;
        color: #333;
        text-align: center;
        font-size: 1.6rem;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        height: 50px;
        line-height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      三峡课题——低代码平台
    </el-header>

    <el-container>
      <!-- 固定左侧组件栏 -->
      <el-aside
        width="300px"
        style="background-color: #ffffff; border-right: 1px solid #ddd"
      >
        <Drawer @addNode="addNode" />
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 工具栏 -->
        <el-header
          style="
            background-color: #fdfdfd;
            display: flex;
            align-items: center;
            padding: 2px;
            border-bottom: 1px solid #ddd;
          "
        >
          <!-- 工具按钮，调整样式和对齐 -->
          <div style="display: flex; gap: 10px; align-items: center">
            <el-tooltip content="项目" placement="bottom">
              <i class="el-icon-menu" />
            </el-tooltip>
            <el-tooltip content="长按shift多选" placement="bottom">
              <i class="el-icon-crop" />
            </el-tooltip>
            <el-tooltip content="放大" placement="bottom">
              <i class="el-icon-zoom-in" @click="zoomFn(0.2)" />
            </el-tooltip>
            <el-tooltip content="缩小" placement="bottom">
              <i class="el-icon-zoom-out" @click="zoomFn(-0.2)" />
            </el-tooltip>
            <el-tooltip content="适应屏幕" placement="bottom">
              <i class="el-icon-full-screen" @click="centerFn" />
            </el-tooltip>
            <el-tooltip content="执行" placement="bottom">
              <i class="el-icon-video-play" @click="startFn()" />
            </el-tooltip>
            <el-tooltip content="保存" placement="bottom">
              <i class="el-icon-upload" @click="saveFn()" />
            </el-tooltip>
            <el-tooltip content="加载保存页面" placement="bottom">
              <i class="el-icon-link" @click="loadFn()" />
            </el-tooltip>
            <el-tooltip content="是否禁用" placement="bottom">
              <i
                :class="{ 'el-icon-lock': isLock, 'el-icon-unlock': !isLock }"
                @click="lockFn()"
              />
            </el-tooltip>
          </div>
        </el-header>

        <!-- 标签页和画布 -->
        <el-main style="position: relative; padding: 0">
          <div @click.stop="hideFn">
            <MenuBar
              v-if="showContextMenu"
              ref="menuBar"
              @callBack="contextMenuFn"
            />
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane
                v-for="(tab, index) in tabs"
                :key="tab.name"
                :label="tab.name"
                :name="String(index)"
              >
                <div
                  v-if="index === 0"
                  ref="drawCot"
                  id="draw-cot"
                  style="height: calc(100vh - 180px); background-color: #1b1b1b"
                >
                  <!-- 画布内容在此 -->
                </div>
              </el-tab-pane>
            </el-tabs>
            <NodeDetailsModal
              :visible.sync="isModalVisible"
              :nodeData="selectedNodeData"
              @update:visible="isModalVisible = false"
              @submit="handleSubmit"
            />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { Graph, Path } from "@antv/x6";
import "@antv/x6-vue-shape";
// import DataJson from "./components/data";
import MenuBar from "./components/menuBar";
import Drawer from "./components/drawer";
import NodeDetailsModal from "./components/NodeDetailsModal.vue";
import api from "../../api.js";
// import DialogCondition from "./components/dialog/condition.vue";
// import DialogMysql from "./components/dialog/mysql.vue";

const nodeStatusList = [
  [
    {
      id: "1",
      status: "running",
    },
    {
      id: "2",
      status: "default",
    },
    {
      id: "3",
      status: "default",
    },
    {
      id: "4",
      status: "default",
    },
  ],
  [
    {
      id: "1",
      status: "success",
    },
    {
      id: "2",
      status: "running",
    },
    {
      id: "3",
      status: "default",
    },
    {
      id: "4",
      status: "default",
    },
  ],
  [
    {
      id: "1",
      status: "success",
    },
    {
      id: "2",
      status: "success",
    },
    {
      id: "3",
      status: "running",
    },
    {
      id: "4",
      status: "running",
    },
  ],
  [
    {
      id: "1",
      status: "success",
    },
    {
      id: "2",
      status: "success",
    },
    {
      id: "3",
      status: "success",
    },
    {
      id: "4",
      status: "failed",
    },
  ],
];

export default {
  name: "DiagramEditor",
  components: { NodeDetailsModal, Drawer, MenuBar },
  data() {
    return {
      graph: "",
      timer: "",
      isLock: false,
      showContextMenu: false,
      projectName: "TestStudio",
      tabs: [
        { name: "图面1", content: "画布1内容" },
        { name: "光伏1", content: "画布2内容" },
      ],
      activeTab: "0", // 默认选中的标签页索引
      isModalVisible: false,
      selectedNodeData: {
        id: "node-1731268485649",
        label: "生成器",
        type: "generator",
        fillColor: "#409EFF",
        lineWidth: 2,
        parameterName: "额定功率",
        input: "Real P",
        output: "Real Heat",
        script: "der(kWh) = P",
      },
    };
  },
  props: ["diagramId"],
  mounted() {
    // 初始化 graph
    this.initGraph();
    // 按钮绑定，绑定键盘快捷键
    this.keyBindFn();
    // 执行，加载初始数据并开始运行
    this.startFn();
    this.graph.on("node:dblclick", ({ node }) => {
      this.selectedNodeData = node.getData();
      this.isModalVisible = true;
    });
  },
  methods: {
    getNodeById(id) {
      return this.graph.getCellById(id);
    },
    hideFn() {
      this.showContextMenu = false;
    },
    initGraph() {
      // 注册节点
      Graph.registerNode(
        "custom-node",
        {
          inherit: "rect",
          width: 100,
          height: 120,
          attrs: {
            body: {
              stroke: "#5F95FF",
              fill: "#EFF4FF",
              rx: 6, // 圆角效果
              ry: 6,
            },
            image: {
              "xlink:href": "", // 图片 URL 动态配置
              width: 60,
              height: 60,
              refX: 20, // 图片居中显示
              refY: 10,
            },
            label: {
              text: "", // 标签文本动态配置
              refY: 80, // 调整文本位置，使其在图片下方
              textAnchor: "middle",
              fontSize: 14,
              fill: "#333",
            },
          },
          data: {
            type: "custom-node", // 定义节点的类型
          },
          markup: [
            {
              tagName: "rect",
              selector: "body",
            },
            {
              tagName: "image",
              selector: "image",
            },
            {
              tagName: "text",
              selector: "label",
            },
          ],
          ports: {
            groups: {
              top: {
                position: "top",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
              right: {
                position: "right",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
              bottom: {
                position: "bottom",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
              left: {
                position: "left",
                attrs: {
                  circle: {
                    r: 4,
                    magnet: true,
                    stroke: "#5F95FF",
                    strokeWidth: 1,
                    fill: "#fff",
                  },
                },
              },
            },
            items: [
              { id: `top-${Date.now()}`, group: "top" }, // 动态生成 ID
              { id: `right-${Date.now()}`, group: "right" },
              { id: `bottom-${Date.now()}`, group: "bottom" },
              { id: `left-${Date.now()}`, group: "left" },
            ],
          },
        },
        true
      );

      Graph.registerEdge(
        "dag-edge",
        {
          inherit: "edge",
          attrs: {
            line: {
              stroke: "#696969",
              strokeWidth: 2,
              targetMarker: {
                name: "classic",
                width: 12,
                height: 8,
              },
            },
          },
          connector: {
            name: "smooth", // 使用平滑曲线连接
          },
          // zIndex: 1, // 提升 z-index 确保边显示在前面
        },
        true
      );
      Graph.registerConnector(
        "algo-connector",
        (s, e) => {
          const offset = 4;
          const deltaY = Math.abs(e.y - s.y);
          const control = Math.floor((deltaY / 3) * 2);

          const v1 = { x: s.x, y: s.y + offset + control };
          const v2 = { x: e.x, y: e.y - offset - control };

          return Path.normalize(
            `M ${s.x} ${s.y}
           L ${s.x} ${s.y + offset}
           C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x} ${e.y - offset}
           L ${e.x} ${e.y}
          `
          );
        },
        true
      );

      const graph = new Graph({
        grid: {
          size: 10,
          visible: true,
          type: "dot", // 'dot' | 'fixedDot' | 'mesh'
          args: {
            color: "#c4bfbf", // 网格线/点颜色
            thickness: 1, // 网格线宽度/网格点大小
          },
        },
        background: {
          color: "#ffffff", // 设置画布背景颜色
        },
        container: document.getElementById("draw-cot"),
        panning: {
          enabled: false,
          eventTypes: ["leftMouseDown", "mouseWheel"],
        },
        mousewheel: {
          enabled: true,
          modifiers: "ctrl",
          factor: 1.1,
          maxScale: 1.5,
          minScale: 0.5,
        },
        highlighting: {
          magnetAdsorbed: {
            name: "stroke",
            args: {
              attrs: {
                fill: "#fff",
                stroke: "#31d0c6",
                strokeWidth: 4,
              },
            },
          },
        },
        connecting: {
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          connector: "algo-connector",
          connectionPoint: "anchor",
          anchor: "center",
          validateMagnet() {
            // return magnet.getAttribute('port-group') !== 'top'

            // 限制连线配置
            return true;
          },
          createEdge() {
            return graph.createEdge({
              shape: "dag-edge",
              attrs: {
                line: {
                  strokeDasharray: "5 5",
                  targetMarker: {
                    name: "block",
                    width: 12,
                    height: 8,
                  },
                },
              },
              zIndex: -1,
            });
          },
        },
        selecting: {
          enabled: true,
          multiple: true,
          rubberEdge: true,
          rubberNode: true,
          modifiers: "shift",
          rubberband: true,
        },
        keyboard: true,
        clipboard: true,
        history: true,
      });
      this.graph = graph;

      // Add border and shadow to the canvas container
      const drawCot = document.getElementById("draw-cot");
      drawCot.style.border = "1px solid #ddd";
      drawCot.style.boxShadow = "0px 4px 8px rgba(0, 0, 0, 0.1)";
      drawCot.style.margin = "20px";
      drawCot.style.backgroundColor = "#f5f5f5";

      graph.on("edge:contextmenu", ({ e, x, y, edge, view }) => {
        console.log(x, y, view);
        this.showContextMenu = true;
        this.$nextTick(() => {
          this.$refs.menuBar.initFn(e.offsetX, e.offsetY, {
            type: "edge",
            item: edge,
          });
        });
      });

      graph.on("node:contextmenu", ({ e, x, y, node, view }) => {
        console.log(e, x, y, view);
        this.showContextMenu = true;

        this.$nextTick(() => {
          // this.$refs.menuBar.setItem({ type: 'node', item: node })
          const p = graph.localToPage(x, y);
          this.$refs.menuBar.initFn(p.x, p.y, { type: "node", item: node });
        });
      });

      graph.on("edge:connected", ({ edge }) => {
        const source = graph.getCellById(edge.source.cell);
        const target = graph.getCellById(edge.target.cell);

        // 只允许输入
        if (target.data.type == "output") {
          return graph.removeEdge(edge.id);
        }

        // 只允许输出
        if (source.data.type == "onlyIn") {
          return graph.removeEdge(edge.id);
        }

        // 如果线源头的一端链接桩只允许输入
        if (/in/.test(edge.source.port)) {
          return graph.removeEdge(edge.id);
        }

        // 目标一端链接桩只允许输出
        if (/out/.test(edge.target.port)) {
          return graph.removeEdge(edge.id);
        }

        if (source.data.type == "condition") {
          console.log(source);
          console.log(target);
          console.log(edge);
          if (target.data.t === edge.id || target.data.f === edge.id) {
            return graph.removeEdge(edge.id);
          }
          this.$refs.dialogCondition.visible = true;
          this.$refs.dialogCondition.init(source.data, edge);
        }

        edge.attr({
          line: {
            strokeDasharray: "",
          },
        });
      });

      graph.on("node:change:data", ({ node }) => {
        const edges = graph.getIncomingEdges(node);
        // const { status } = node.getData();
        edges?.forEach((edge) => {
          if (status === "running") {
            edge.attr("line/strokeDasharray", 5);
            edge.attr(
              "line/style/animation",
              "running-line 30s infinite linear"
            );
          } else {
            edge.attr("line/strokeDasharray", "");
            edge.attr("line/style/animation", "");
          }
        });
      });
    },
    async showNodeStatus(statusList) {
      // const status = statusList.shift();
      // status?.forEach((item) => {
      //   const { id, status } = item;
      //   const node = this.graph.getCellById(id);
      //   // const data = node.getData();
      //   // node.setData({
      //   //   ...data,
      //   //   status: status,
      //   // });
      // });
      this.timer = setTimeout(() => {
        this.showNodeStatus(statusList);
      }, 300);
    },
    // 初始化节点/边
    init(data = []) {
      const cells = [];
      data.forEach((item) => {
        if (item.shape === "dag-edge") {
          cells.push(this.graph.createEdge(item));
        } else {
          delete item.component;
          cells.push(
            this.graph.createNode({
              ...item,
              data: {
                label: item.data?.label || "未命名", // 防止 label 为 undefined
                icon: item.data?.icon || "https://via.placeholder.com/50", // 设置默认图标
              },
            })
          ); // 关闭括号时确保格式正确
        }
      });
      this.graph.resetCells(cells); // 加载所有节点和边
    },
    zoomFn(num) {
      this.graph.zoom(num);
    },
    centerFn() {
      const num = 1 - this.graph.zoom();
      num > 1 ? this.graph.zoom(num * -1) : this.graph.zoom(num);
      this.graph.centerContent();
    },
    startFn(item) {
      this.timer && clearTimeout(this.timer);
      this.init(item);
      this.showNodeStatus(Object.assign([], nodeStatusList));
      this.graph.centerContent();
    },
    createMenuFn() {},
    keyBindFn() {
      // copy cut paste
      this.graph.bindKey(["meta+c", "ctrl+c"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.copy(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+x", "ctrl+x"], () => {
        const cells = this.graph.getSelectedCells();
        if (cells.length) {
          this.graph.cut(cells);
        }
        return false;
      });
      this.graph.bindKey(["meta+v", "ctrl+v"], () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 });
          this.graph.cleanSelection();
          this.graph.select(cells);
        }
        return false;
      });

      // undo redo
      this.graph.bindKey(["meta+z", "ctrl+z"], () => {
        if (this.graph.history.canUndo()) {
          this.graph.history.undo();
        }
        return false;
      });
      // delete
      this.graph.bindKey(["delete"], () => {
        const select = this.graph.getSelectedCells();
        select?.forEach((item) => {
          if (/edge/.test(item.shape)) {
            this.graph.removeEdge(item.id);
          } else {
            this.graph.removeNode(item.id);
          }
        });
        return false;
      });
    },
    saveFn() {
      const json = this.graph.toJSON(); // 获取流程图的 JSON 格式数据
      console.log("save");
      console.log(JSON.stringify(json, null, 2)); // 打印在控制台，格式化输出
      localStorage.setItem(
        "x6Json",
        JSON.stringify(this.graph.toJSON({ diff: true }))
      );
    },
    loadFn() {
      this.timer && clearTimeout(this.timer);
      const x6Json = JSON.parse(localStorage.getItem("x6Json"));

      this.startFn(x6Json.cells);
    },
    lockFn() {
      this.isLock = !this.isLock;
      if (this.isLock) {
        this.graph.enablePanning();
        this.graph.enableKeyboard();
      } else {
        this.graph.disablePanning();
        this.graph.disableKeyboard();
      }
    },
    contextMenuFn(type, node) {
      switch (type) {
        case "remove":
          if (node.type == "edge") {
            this.graph.removeEdge(node.item.id);
          } else if (node.type == "node") {
            this.graph.removeNode(node.item.id);
          }
          break;
        case "source":
          this.$refs.dialogMysql.visible = true;
          this.$refs.dialogMysql.init(node);
          break;
      }

      this.showContextMenu = false;
    },

    showDrawerFn() {
      this.$refs.drawer.visible = !this.$refs.drawer.visible;
    },
    addNode({ icon, label, x, y }) {
      const { left, top, right, bottom } = document
        .getElementById("draw-cot")
        .getBoundingClientRect();
      if (x > left && x < right && y > top && y < bottom) {
        const localPosition = this.graph.pageToLocal(x, y); // 转换成相对坐标
        this.graph.addNode({
          label: label,
          x: localPosition.x,
          y: localPosition.y,
          shape: "custom-node", // 节点形状
          data: {
            id: `node-${Date.now()}`,
            label: label,
          },
          attrs: {
            image: {
              "xlink:href": icon,
            },
            label: {
              text: label,
            },
          },
        });
      }
    },
    handleSubmit(nodeData) {
      // 调用 api.js 中的 updateNode 方法
      api
        .updateNode(nodeData.id, nodeData)
        .then((response) => {
          console.log("提交成功：", response.data);
          // 可以根据需要在此处处理提交成功的后续操作
          this.$message.success("节点数据提交成功！");
        })
        .catch((error) => {
          console.error("提交失败：", error);
          this.$message.error("节点数据提交失败，请重试！");
        });
    },
  },
};
</script>

<style lang="less" scoped>
header {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 40px;
  box-sizing: border-box;
}

header i {
  margin: 8px;
  font-size: 30px;
}
.x6-node-selected .node {
  border-color: #1890ff;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .node.success {
  border-color: #52c41a;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .node.failed {
  border-color: #ff4d4f;
  border-radius: 2px;
  box-shadow: 0 0 0 4px #fedcdc;
}

.x6-edge:hover path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1px;
}

.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px !important;
}

.section-cot {
  display: flex;
}

.section-cot #container {
  position: relative;
  flex: 1;
}

.section-cot #container #draw-cot {
  width: 100%;
  height: 100%;
}

.custom-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  width: 100px;
  height: 100px;
}

.node-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.node-label {
  margin-top: 8px;
  color: #333;
  font-size: 14px;
}

::-webkit-scrollbar {
  width: 0;
}

#draw-cot {
  margin: 30px 30px 30px 30px;
  // margin: 0;
  padding: 20px;
  border: 1px solid #ddd;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  overflow: hidden; /* 限制内容超出 */
  max-width: 90%; /* 设置最大宽度 */
  max-height: calc(100vh - 220px); /* 设置最大高度 */
  // max-height: 100%;
}
</style>
