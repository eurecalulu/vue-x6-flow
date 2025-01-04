<template>
  <el-container style="height: 100vh; background-color: #f5f5f5">
    <!-- 顶部标题栏 -->
    <el-header
      style="
        background-color: #f0f0f0;
        color: #333;
        text-align: center;
        font-size: 1.4rem;
        font-weight: bold;
        border-bottom: 1px solid #ddd;
        height: 45px;
        line-height: 45px;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div>综合能源EMS能碳云数模智能仿真与优化控制管理平台</div>
    </el-header>

    <el-container>
      <!-- 固定左侧组件栏 -->
      <el-aside
        width="280px"
        style="background-color: #f7f7f7; border-right: 0.2px solid #ddd"
      >
        <Drawer
          @addNode="addNode"
          :modelId="effectiveModelId"
          :diagramType="this.diagramType"
        />
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <!-- 工具栏 -->
        <el-header
          style="
            background-color: #f7f7f7;
            display: flex;
            align-items: center;
            padding: 2px;
            border-bottom: 1px solid #ddd;
            height: 40px; /* Reduced height */
            line-height: 40px; /* Align items vertically */
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
            <!--            <el-tooltip content="加载保存页面" placement="bottom">-->
            <!--              <i class="el-icon-link" @click="loadFn()" />-->
            <!--            </el-tooltip>-->
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
                :label="displayName"
                :name="String(index)"
              >
                <div
                  v-if="index === 0"
                  ref="drawCot"
                  id="draw-cot"
                  class="canvas-container"
                >
                  <!-- 画布内容在此 -->
                </div>
              </el-tab-pane>
            </el-tabs>
            <NodeDetailsModal
              v-if="diagramType !== 'controller'"
              :visible.sync="isModalVisible"
              :nodeData="selectedNodeData"
              @update:visible="isModalVisible = false"
              @submit="handleSubmit"
            />
            <ControllerNodeDetailsModal
              v-if="diagramType === 'controller'"
              :visible.sync="isControllerNodeModalVisible"
              :nodeData="selectedControllerNodeData"
              @update:visible="isControllerNodeModalVisible = false"
              @submit="handleControllerNodeSubmit"
            />
            <ControllerEdgeDetailsModal
              v-if="diagramType === 'controller'"
              :visible.sync="isControllerEdgeModalVisible"
              :edgeData="selectedControllerEdgeData"
              @update:visible="isControllerEdgeModalVisible = false"
              @submit="handleControllerEdgeSubmit"
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

import MenuBar from "./components/menuBar";
import Drawer from "./components/drawer";
import NodeDetailsModal from "./components/NodeDetailsModal.vue";
import ControllerNodeDetailsModal from "./components/ControllerNodeDetailsModal.vue";
import ControllerEdgeDetailsModal from "./components/ControllerEdgeDetailsModal.vue";
import api from "../../api.js";
// import { Transform } from "@antv/x6-plugin-transform";

export default {
  name: "DiagramEditor",
  components: {
    NodeDetailsModal,
    Drawer,
    MenuBar,
    ControllerNodeDetailsModal,
    ControllerEdgeDetailsModal,
  },
  data() {
    return {
      graph: "",
      timer: "",
      isLock: false,
      showContextMenu: false,
      projectName: "TestStudio",
      tabs: [{ name: "图面1", content: "画布1内容" }],
      activeTab: "0", // 默认选中的标签页索引
      isModalVisible: false,
      selectedNodeData: {
        id: "node-1731268485649",
        name: "生成器",
        label: "生成器",
        type: "控制组件",
        parameters: [],
        inputs: [],
        outputs: [],
        scripts: "der(kWh) = P",
        properties: {
          fillColor: "#f5f5f5",
          lineWidth: 2,
        },
      },
      graphProperties: {},
      autoSaveInterval: null,
      displayName: null, // 模型名称
      isControllerNodeModalVisible: false,
      selectedControllerNodeData: {
        id: "node-1731268485649",
        number: 1,
        name: "生成器",
        label: "生成器",
        scripts: "",
        controllerNodeType: "",
        properties: {
          fillColor: "#f5f5f5",
          lineWidth: 2,
        },
      },
      isControllerEdgeModalVisible: false,
      selectedControllerEdgeData: {
        id: "edge-1731268485649",
        name: "生成器",
        judgmentScripts: "",
        actionScripts: "",
        properties: {
          fillColor: "#f5f5f5",
          lineWidth: 2,
        },
      },
    };
  },
  props: ["diagramId", "modelId", "projectId", "diagramType"],
  computed: {
    // 使用计算属性来动态获取 modelId 和 projectId
    effectiveModelId() {
      return this.modelId || this.$route.params.modelId || ""; // 如果没有传递 modelId，默认为空
    },
    effectiveProjectId() {
      return this.projectId || this.$route.params.projectId || ""; // 如果没有传递 projectId，默认为空
    },
  },
  mounted() {
    this.fetchDisplayName();
    // 初始化 graph
    this.initGraph();
    // 按钮绑定，绑定键盘快捷键
    this.keyBindFn();
    // 加载图表数据
    this.loadGraphData();
    // 执行，加载初始数据并开始运行
    this.startFn();
    // 启动自动保存定时器，每3分钟执行一次
    // this.autoSaveInterval = setInterval(() => {
    //   this.saveFn();
    // }, 180000); // 180000 毫秒 = 3 分钟
  },
  // beforeDestroy() {
  //   // 在组件销毁前清除定时器
  //   if (this.autoSaveInterval) {
  //     clearInterval(this.autoSaveInterval);
  //   }
  // },
  methods: {
    // 根据 modelId 或 projectId 获取对应的名称并赋值给 displayName
    async fetchDisplayName() {
      try {
        if (this.effectiveModelId) {
          // 如果 effectiveModelId 存在，从模型接口获取名称
          const response = await api.queryModel(this.effectiveModelId); // 假设接口为 queryModel
          this.displayName = response.data?.data?.name || "未知模型";
        } else if (this.effectiveProjectId) {
          // 如果 effectiveModelId 不存在，且 effectiveProjectId 存在，从项目接口获取名称
          const response = await api.queryProject(this.effectiveProjectId); // 假设接口为 queryProject
          this.displayName = response.data?.data?.name || "未知项目";
        } else {
          this.displayName = "未知名称"; // 如果两者都不存在，设置默认值
        }
        // 动态更新 tab 的名称为 displayName
        // 只更新 name 字段
        // this.$set(this.tabs[0], "name", this.displayName);
      } catch (error) {
        console.error("获取名称失败：", error);
        this.displayName = "未知名称"; // 错误时也设置默认值
        // 使用 $set 来确保响应式更新
        // this.$set(this.tabs, 0, { name: this.displayName, content: "画布1内容" });
      }
    },
    async loadGraphData() {
      try {
        const response = await api.queryDiagram(this.diagramId); // 假设你的接口是 getDiagramData
        const graphData = response.data?.data?.properties?.graphData || {
          cells: [],
        };
        this.graphProperties = response.data?.properties || {};
        console.log("graph", graphData);
        this.graph.fromJSON(graphData); // 使用 fromJson 加载图表数据
      } catch (error) {
        console.error("获取图表数据失败：", error);
        this.graph.fromJSON({ cells: [] });
      }
    },

    async handleNodeDblClick(nodeId) {
      try {
        if (!nodeId) {
          throw new Error("节点ID无效");
        }

        let nodeData = null;

        // 第一步：尝试从后端查询节点数据
        const response = await api.queryNode(nodeId);
        if (response && response.data && response.data.data) {
          nodeData = response.data.data;
        }

        // 第二步：如果后端未找到节点数据，则从本地图形实例中获取
        if (!nodeData) {
          const node = this.graph.getCell(nodeId);
          if (node) {
            nodeData = node.getData();
            // 如果需要，可以在这里添加更多逻辑来处理新节点的数据
          }
        }

        // 第三步：如果仍然没有节点数据，则显示错误消息
        if (!nodeData) {
          this.$message.error("无法加载节点数据，请稍后重试！");
          return;
        }

        // 将 nodeId 赋值给 nodeData.id（如果 nodeData 不存在 id 属性）
        if (!nodeData.id) {
          nodeData.id = nodeId;
        }

        // 将获取的节点数据赋值给 `selectedNodeData` 并显示侧边栏
        this.selectedNodeData = nodeData;
        console.log("selectedNodeData", nodeData);
        this.isModalVisible = true;
      } catch (error) {
        console.error("获取节点数据失败：", error);
        this.$message.error("无法加载节点数据，请稍后重试！");
      }
    },

    async handleControllerNodeDblClick(nodeId) {
      try {
        if (!nodeId) {
          throw new Error("节点ID无效");
        }

        let nodeData = null;

        // 第一步：尝试从后端查询节点数据
        const response = await api.queryNode(nodeId);
        if (response && response.data && response.data.data) {
          nodeData = response.data.data;
        }

        // 第二步：如果后端未找到节点数据，则从本地图形实例中获取
        if (!nodeData) {
          const node = this.graph.getCell(nodeId);
          if (node) {
            nodeData = node.getData();
            // 如果需要，可以在这里添加更多逻辑来处理新节点的数据
          }
        }

        // 第三步：如果仍然没有节点数据，则显示错误消息
        if (!nodeData) {
          this.$message.error("无法加载控制节点数据，请稍后重试！");
          return;
        }

        // 将 nodeId 赋值给 nodeData.id（如果 nodeData 不存在 id 属性）
        if (!nodeData.id) {
          nodeData.id = nodeId;
        }

        // 将获取的节点数据赋值给 `selectedNodeData` 并显示侧边栏
        this.selectedControllerNodeData = nodeData;
        console.log("selectedControllerNodeData", nodeData);
        this.isControllerNodeModalVisible = true;
      } catch (error) {
        console.error("获取控制节点数据失败：", error);
        this.$message.error("无法加载控制节点数据，请稍后重试！");
      }
    },

    async handleEdgeDblClick(edgeId) {
      try {
        if (!edgeId) {
          throw new Error("边ID无效");
        }

        let edgeData = null;

        // 第一步：尝试从后端查询边的数据
        const response = await api.queryLine(edgeId);
        if (response && response.data && response.data.data) {
          edgeData = response.data.data;
        }

        console.log("edgeDataaaa", edgeData);

        // 第二步：如果后端未找到边的数据，则从本地图形实例中获取
        if (!edgeData) {
          const edge = this.graph.getCell(edgeId);
          if (edge) {
            edgeData = edge.getData();
            // 如果需要，可以在这里添加更多逻辑来处理新节点的数据
          }
        }

        // 第三步：如果仍然没有节点数据，则显示错误消息
        if (!edgeData) {
          this.$message.error("无法加载边的数据，请稍后重试！");
          return;
        }

        // 将 nodeId 赋值给 nodeData.id（如果 nodeData 不存在 id 属性）
        if (!edgeData.id) {
          edgeData.id = edgeId;
        }

        // 将获取的节点数据赋值给 `selectedNodeData` 并显示侧边栏
        this.selectedControllerEdgeData = edgeData;
        console.log("selectedControllerEdgeData", edgeData);
        this.isControllerEdgeModalVisible = true;
      } catch (error) {
        console.error("获取边的数据失败：", error);
        this.$message.error("无法加载边的数据，请稍后重试！");
      }
    },

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
              stroke: "#f5f5f5",
              fill: "#f5f5f5",
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
            // id: "", // 节点 ID
            name: "", // 节点名字
            diagramId: "", // 所属图的 ID
            modelId: "", // 节点对应的模型类型
            parameters: [], // 节点参数
            inputs: [], // 输入
            outputs: [], // 输出
            scripts: "", // 脚本
            signals: "", // 信号
            properties: {}, // 其他属性信息（如颜色、大小等）
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
                    stroke: "#333",
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
                    stroke: "#333",
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
                    stroke: "#333",
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
                    stroke: "#333",
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
          enabled: true,
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

      graph.on("edge:contextmenu", ({ e, x, y, edge, view }) => {
        //  右键点击一条边触发
        console.log(x, y, view);
        this.showContextMenu = true;
        this.$nextTick(() => {
          this.$refs.menuBar.initFn(e.offsetX, e.offsetY, {
            type: "edge",
            item: edge,
          });
        });
      });

      graph.on("node:contextmenu", ({ e, node }) => {
        // 获取鼠标相对于页面的坐标
        const { x, y } = { x: e.clientX, y: e.clientY };

        // 获取图表容器的边界信息
        const { left, top, right, bottom } = document
          .getElementById("draw-cot")
          .getBoundingClientRect();

        console.log("图表容器的边界：", { left, top, right, bottom });

        // 判断鼠标是否点击在图表容器内
        if (x > left && x < right && y > top && y < bottom) {
          // 计算相对于图表容器的坐标
          const localX = x - left;
          const localY = y - top;

          // 打印相对坐标，帮助调试
          console.log("相对图表容器的坐标:", { localX, localY });

          // 获取菜单栏的宽度和高度
          const menuBarWidth = 150; // 假设菜单宽度为 150px
          const menuBarHeight = 50; // 假设菜单高度为 50px

          // 如果菜单的右侧超出了容器右边界，调整菜单的 X 坐标
          let adjustedX = localX;
          if (localX + menuBarWidth > right - left) {
            adjustedX = right - left - menuBarWidth;
          }

          // 如果菜单的下侧超出了容器下边界，调整菜单的 Y 坐标
          let adjustedY = localY;
          if (localY + menuBarHeight > bottom - top) {
            adjustedY = bottom - top - menuBarHeight;
          }

          // 打印调整后的坐标
          console.log("调整后的坐标:", { adjustedX, adjustedY });

          // 显示右键菜单，并传递节点信息和坐标
          this.showContextMenu = true;

          this.$nextTick(() => {
            this.$refs.menuBar.initFn(adjustedX + 50, adjustedY + 50, {
              type: "node",
              item: node,
            });
          });
        }
      });

      graph.on("edge:connected", ({ edge }) => {
        // 当边被节点连接时触发
        // 这里的目前都没太多用
        // const source = graph.getCellById(edge.source.cell);
        // const target = graph.getCellById(edge.target.cell);

        // // 只允许输入
        // if (target.data.type == "output") {
        //   return graph.removeEdge(edge.id);
        // }
        //
        // // 只允许输出
        // if (source.data.type == "onlyIn") {
        //   return graph.removeEdge(edge.id);
        // }
        //
        // // 如果线源头的一端链接桩只允许输入
        // if (/in/.test(edge.source.port)) {
        //   return graph.removeEdge(edge.id);
        // }
        //
        // // 目标一端链接桩只允许输出
        // if (/out/.test(edge.target.port)) {
        //   return graph.removeEdge(edge.id);
        // }
        //
        // if (source.data.type == "condition") {
        //   console.log(source);
        //   console.log(target);
        //   console.log(edge);
        //   if (target.data.t === edge.id || target.data.f === edge.id) {
        //     return graph.removeEdge(edge.id);
        //   }
        //   this.$refs.dialogCondition.visible = true;
        //   this.$refs.dialogCondition.init(source.data, edge);
        // }

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

      graph.on("node:dblclick", ({ node }) => {
        if (this.diagramType === "controller") {
          this.selectedControllerNodeData = node.getData();
          const nodeId = node.id; // 获取节点的 ID
          this.handleControllerNodeDblClick(nodeId); // 调用方法获取节点数据并显示侧边栏
        } else {
          this.selectedNodeData = node.getData();
          const nodeId = node.id; // 获取节点的 ID
          this.handleNodeDblClick(nodeId); // 调用方法获取节点数据并显示侧边栏
        }
      });

      graph.on("edge:dblclick", ({ edge }) => {
        if (this.diagramType === "controller") {
          this.selectedEdgeData = edge.getData(); // 获取边的数据
          const edgeId = edge.id; // 获取边的 ID
          this.handleEdgeDblClick(edgeId); // 调用方法处理边的双击事件，显示侧边栏
        }
      });
    },

    // end of initGraph
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
    startFn() {
      this.timer && clearTimeout(this.timer);
      // this.init(item);
      // this.showNodeStatus(Object.assign([], nodeStatusList));
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
    async saveFn() {
      try {
        const graphData = this.graph.toJSON(); // 获取当前图表的 JSON 数据
        const diagramRequestBody = {
          id: this.diagramId, // 假设 diagramId 存储了当前图表的 ID
          properties: {
            graphData: graphData, // 将 graphData 放在 properties 中
            ...this.graphProperties,
          },
        };

        // 2. 提取节点和边的数据
        const nodes = graphData.cells
          .filter((cell) => cell.shape !== "dag-edge") // 筛选节点
          .map((node) => ({
            id: node.id, // 节点 ID
            name: node.data?.name || "", // 节点的名字
            diagramId: this.diagramId, // 节点所属的画面 ID
            modelId: this.modelId, // 节点对应的模型类型
            parameters: node.data?.parameters || [], // 参数
            inputs: node.data?.inputs || [], // 输入
            outputs: node.data?.outputs || [], // 输出
            scripts: node.data?.scripts || "", // 脚本
            signals: node.data?.signals || "", // 信号
            // 动态包含所有 data 字段，防止遗漏
            ...node.data,
            properties: {
              category: node.data?.properties?.category,
              position: node.position, // 节点位置
              shape: node.shape, // 节点形状
              attrs: node.attrs, // 属性信息（如颜色、大小等）
              // 动态包含属性中的其他字段
              ...node.data?.properties,
            },
          }));

        const edges = graphData.cells
          .filter((cell) => cell.shape === "dag-edge") // 筛选边
          .map((edge) => ({
            id: edge.id, // 连接线 ID
            name: edge.data?.label || "", // 连接线的名字
            diagramId: this.diagramId, // 连接线所属的画面 ID
            sourceNodeId: edge.source.cell || "", // 起始节点 ID
            targetNodeId: edge.target.cell || "", // 终到节点 ID
            // 动态包含所有 data 字段，防止遗漏
            ...edge.data,
            properties: {
              attrs: edge.attrs, // 属性信息（如颜色、线宽等）
              // 动态包含属性中的其他字段
              ...edge.data?.properties,
            },
          }));
        await Promise.all([
          api.updateDiagram(diagramRequestBody), // 保存图表
          api.saveOrUpdateNodeList(this.diagramId, nodes), // 批量保存节点
          api.saveOrUpdateLineList(this.diagramId, edges), // 批量保存边
        ]);
        this.$message.success("保存图表数据成功");
      } catch (error) {
        console.error("保存图表数据失败：", error);
      }
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

    addNode({ shape, label, type, icon, x, y }) {
      const { left, top, right, bottom } = document
        .getElementById("draw-cot")
        .getBoundingClientRect();

      if (x > left && x < right && y > top && y < bottom) {
        const localPosition = this.graph.pageToLocal(x, y); // 转换成相对坐标

        // 1. 处理水平直线
        if (shape === "straight-line-horizontal") {
          this.addHorizontalLine(localPosition);
          return;
        }

        // 2. 处理垂直直线
        if (shape === "straight-line-vertical") {
          this.addVerticalLine(localPosition);
          return;
        }

        // 3. 处理其他基础组件
        if (["rect", "circle", "ellipse", "polygon"].includes(shape)) {
          this.addBasicNode(localPosition, shape, label, type);
          return;
        }

        // 4. 默认通用组件逻辑
        this.addCustomNode(localPosition, label, type, icon);
      }
    },

    addHorizontalLine(position) {
      this.graph.addNode({
        shape: "path",
        x: position.x,
        y: position.y,
        width: 400, // 固定长度
        height: 10, // 直线高度
        attrs: {
          body: {
            d: "M 0 5 L 400 5", // 水平直线，长度固定为 400
            stroke: "#333",
            strokeWidth: 2,
          },
        },
        ports: {
          groups: {
            line: {
              position: "absolute",
              attrs: {
                circle: {
                  r: 4, // 连接点半径
                  magnet: true, // 允许拖拽连接
                  stroke: "#000",
                  fill: "#FFF",
                  strokeWidth: 1,
                },
              },
            },
          },
          items: [
            { id: "port-left", group: "line", args: { x: 0, y: 5 } }, // 左端
            { id: "port-middle-1", group: "line", args: { x: 100, y: 5 } }, // 1/4 处
            { id: "port-middle-2", group: "line", args: { x: 200, y: 5 } }, // 中点
            { id: "port-middle-3", group: "line", args: { x: 300, y: 5 } }, // 3/4 处
            { id: "port-right", group: "line", args: { x: 400, y: 5 } }, // 右端
          ],
        },
      });
    },

    addVerticalLine(position) {
      this.graph.addNode({
        shape: "path",
        x: position.x,
        y: position.y,
        width: 10, // 直线宽度
        height: 400, // 固定长度
        attrs: {
          body: {
            d: "M 5 0 L 5 400", // 垂直直线，长度固定为 400
            stroke: "#333",
            strokeWidth: 2,
          },
        },
        ports: {
          groups: {
            line: {
              position: "absolute",
              attrs: {
                circle: {
                  r: 4, // 连接点半径
                  magnet: true, // 允许拖拽连接
                  stroke: "#000",
                  fill: "#FFF",
                  strokeWidth: 1,
                },
              },
            },
          },
          items: [
            { id: "port-top", group: "line", args: { x: 5, y: 0 } }, // 顶端
            { id: "port-middle-1", group: "line", args: { x: 5, y: 100 } }, // 1/4 处
            { id: "port-middle-2", group: "line", args: { x: 5, y: 200 } }, // 中点
            { id: "port-middle-3", group: "line", args: { x: 5, y: 300 } }, // 3/4 处
            { id: "port-bottom", group: "line", args: { x: 5, y: 400 } }, // 底端
          ],
        },
      });
    },

    addBasicNode(position, shape, label, type) {
      // Determine the label based on diagramType
      let nodeLabel = label || "基础组件";
      let nodeCount = 0;

      if (this.diagramType === "controller") {
        // 获取当前图中节点的数量并加一
        nodeCount = this.graph.getNodes().length;
        nodeLabel = nodeCount.toString();
      }

      let controllerNodeCategory = type;
      if (this.diagramType === "controller") {
        // 获取当前图中节点的数量并加一
        controllerNodeCategory = "中间节点";
      }

      this.graph.addNode({
        shape,
        x: position.x,
        y: position.y,
        width: shape === "circle" ? 80 : 100,
        height: shape === "circle" ? 80 : 60,
        label: nodeLabel,
        data: {
          name: label,
          diagramId: this.diagramId,
          modelId: this.modelId,
          parameters: [],
          inputs: [],
          outputs: [],
          scripts: "",
          signals: "",
          properties: {
            category: controllerNodeCategory,
          },
          simuParameters: {},
          simuInputs: {},
          simuOutputs: {},
          controllerMinInterval: 0,
          controllerOrderMinInterval: 0,
          simpleDataMinInterval: 0,
          controllerRespMinInterval: 0,
          signalsBindDeviceId: "",
          signalsBindParam: {},
          number: nodeCount,
          type: this.diagramType,
        },
        attrs: {
          body: {
            fill: "#EFEFEF",
            stroke: "#333",
            strokeWidth: 2,
          },
          label: {
            text: nodeLabel,
            fontSize: 14,
            fill: "#000",
          },
        },
        ports: {
          groups: {
            top: {
              position: "top",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#000",
                  strokeWidth: 1,
                  fill: "#FFF",
                },
              },
            },
            right: {
              position: "right",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#000",
                  strokeWidth: 1,
                  fill: "#FFF",
                },
              },
            },
            bottom: {
              position: "bottom",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#000",
                  strokeWidth: 1,
                  fill: "#FFF",
                },
              },
            },
            left: {
              position: "left",
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: "#000",
                  strokeWidth: 1,
                  fill: "#FFF",
                },
              },
            },
          },
          items: [
            { id: "port-top", group: "top" },
            { id: "port-right", group: "right" },
            { id: "port-bottom", group: "bottom" },
            { id: "port-left", group: "left" },
          ],
        },
      });
    },

    addCustomNode(position, label, type, icon) {
      this.graph.addNode({
        shape: "custom-node",
        x: position.x,
        y: position.y,
        label: label || "通用组件",
        data: {
          name: label,
          diagramId: this.diagramId,
          modelId: this.modelId,
          parameters: [],
          inputs: [],
          outputs: [],
          scripts: "",
          signals: "",
          properties: {
            category: type,
          },
          simuParameters: {},
          simuInputs: {},
          simuOutputs: {},
          controllerMinInterval: 0,
          controllerOrderMinInterval: 0,
          simpleDataMinInterval: 0,
          controllerRespMinInterval: 0,
          signalsBindDeviceId: "",
          signalsBindParam: {},
          type: this.diagramType,
        },
        attrs: {
          image: {
            "xlink:href": icon,
          },
          label: {
            text: label || "通用组件",
          },
        },
      });
    },

    async handleSubmit(nodeData) {
      console.log("提交的节点数据:", nodeData); // 检查数据结构
      try {
        // 调用 API 更新节点数据
        await api.updateNode(nodeData);
        this.$message.success("节点数据提交成功！");

        // 获取图表中的节点
        const node = this.graph.getCell(nodeData.id);
        console.log("graph", this.graph.toJSON());
        console.log("nodee", node);
        if (node) {
          // 更新节点的数据
          node.setData(nodeData);

          // 更新节点的视觉属性，例如标签
          if (nodeData.name) {
            node.attr("label/text", nodeData.name);
          }

          // 如果需要更新其他视觉属性，例如填充颜色
          if (nodeData.properties && nodeData.properties.fillColor) {
            node.attr("body/fill", nodeData.properties.fillColor);
          }

          // 如果有其他需要更新的视觉属性，可以在这里继续添加
        } else {
          console.warn(`未找到 ID 为 ${nodeData.id} 的节点`);
        }
      } catch (error) {
        console.error("提交失败：", error);
        if (error.response) {
          console.error("服务器响应数据:", error.response.data);
          this.$message.error(
            `提交失败：${error.response.data.message || "请检查输入内容"}`
          );
        } else {
          this.$message.error("网络错误，请稍后重试！");
        }
      }
    },

    async handleControllerNodeSubmit(nodeData) {
      console.log("提交的控制节点数据:", nodeData); // 检查数据结构
      try {
        // 调用 API 更新节点数据
        await api.updateNode(nodeData);
        this.$message.success("控制节点数据提交成功！");

        // 获取图表中的节点
        const node = this.graph.getCell(nodeData.id);
        console.log("graph", this.graph.toJSON());
        console.log("nodee", node);
        if (node) {
          // 更新节点的数据
          node.setData(nodeData);

          // 更新节点的视觉属性，例如标签
          if (nodeData.number) {
            node.attr("label/text", nodeData.number.toString());
          }

          // 如果需要更新其他视觉属性，例如填充颜色
          if (nodeData.properties && nodeData.properties.fillColor) {
            node.attr("body/fill", nodeData.properties.fillColor);
          }

          // 如果有其他需要更新的视觉属性，可以在这里继续添加
        } else {
          console.warn(`未找到 ID 为 ${nodeData.id} 的控制节点`);
        }
      } catch (error) {
        console.error("提交失败：", error);
        if (error.response) {
          console.error("服务器响应数据:", error.response.data);
          this.$message.error(
            `提交失败：${error.response.data.message || "请检查输入内容"}`
          );
        } else {
          this.$message.error("网络错误，请稍后重试！");
        }
      }
    },

    async handleControllerEdgeSubmit(edgeData) {
      console.log("提交的控制单元连接数据:", edgeData); // 检查数据结构
      try {
        // 调用 API 更新节点数据
        await api.updateLine(edgeData);
        this.$message.success("控制单元连接数据提交成功！");

        // 获取图表中的节点
        const edge = this.graph.getCell(edgeData.id);
        console.log("graph", this.graph.toJSON());
        console.log("edge", edge);
        if (edge) {
          // 更新节点的数据
          edge.setData(edgeData);

          // 如果需要更新其他视觉属性，例如填充颜色
          if (edgeData.properties && edgeData.properties.fillColor) {
            edge.attr("body/fill", edgeData.properties.fillColor);
          }

          // 如果有其他需要更新的视觉属性，可以在这里继续添加
        } else {
          console.warn(`未找到 ID 为 ${edgeData.id} 的连接线`);
        }
      } catch (error) {
        console.error("提交失败：", error);
        if (error.response) {
          console.error("服务器响应数据:", error.response.data);
          this.$message.error(
            `提交失败：${error.response.data.message || "请检查输入内容"}`
          );
        } else {
          this.$message.error("网络错误，请稍后重试！");
        }
      }
    },
  },
};
</script>

<style lang="less" scoped>
#draw-cot {
  margin-left: 20px;
  margin-right: 5px;
  margin-top: 10px;
  padding: 0px;
  border: 1px solid #ddd;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  background-color: #f5f5f5;
  overflow: auto;
  width: 95%;
  height: calc(100vh - 200px); /* 保证画布自适应高度 */
}

/* 工具栏按钮 hover 效果 */
header i {
  margin: 8px;
  font-size: 20px;
}

/* 选中节点的样式 */
.x6-node-selected .node {
  border-color: #1890ff;
  box-shadow: 0 0 0 4px #d4e8fe;
}

.x6-node-selected .node.success {
  border-color: #52c41a;
  box-shadow: 0 0 0 4px #ccecc0;
}

.x6-node-selected .node.failed {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 4px #fedcdc;
}

/* 边 hover 和选中效果 */
.x6-edge:hover path:nth-child(2),
.x6-edge-selected path:nth-child(2) {
  stroke: #1890ff;
  stroke-width: 1.5px;
}

.custom-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

/* 去除滚动条 */
::-webkit-scrollbar {
  width: 0;
}

/* Scoped styles to override Element UI's default selected tab color */
:deep(.el-tabs__item.is-active) {
  color: #555555 !important; /* Deep gray color for text */
  border-bottom: 2px solid #555555 !important; /* Deep gray border for the active tab */
}

:deep(.el-tabs__active-bar) {
  background-color: #555555 !important; /* Deep gray indicator bar */
}

.el-icon-menu:hover,
.el-icon-crop:hover,
.el-icon-zoom-in:hover,
.el-icon-zoom-out:hover,
.el-icon-full-screen:hover,
.el-icon-video-play:hover,
.el-icon-upload:hover,
.el-icon-link:hover,
.el-icon-lock:hover,
.el-icon-unlock:hover {
  color: #333333; /* 悬停时的深灰色效果 */
}
</style>
