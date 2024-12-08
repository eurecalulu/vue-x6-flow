<template>
  <el-container
    style="
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
    "
  >
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
      <!-- 主内容区 -->
      <el-container
        style="height: 100vh; display: flex; flex-direction: column"
      >
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
          <div
            style="
              display: flex;
              gap: 15px;
              margin-left: 2px;
              align-items: center;
            "
          >
            <!-- 检查按钮 -->
            <el-button
              icon="el-icon-check"
              size="mini"
              type="default"
              @click="checkFn"
              style="font-size: 12px"
            >
              绑定信号
            </el-button>
            <!-- 编译按钮 -->
            <el-button
              icon="el-icon-refresh"
              size="mini"
              type="default"
              @click="compileFn"
              style="font-size: 12px"
            >
              检查
            </el-button>
            <el-button
              icon="el-icon-caret-right"
              size="mini"
              type="default"
              @click="runFn"
              style="font-size: 12px"
            >
              编译
            </el-button>
            <el-button
              icon="el-icon-video-play"
              size="mini"
              type="default"
              @click="openSimulationConfig"
              style="font-size: 12px"
            >
              运行
            </el-button>
            <!-- 下载按钮 -->
            <el-button
              icon="el-icon-upload"
              size="mini"
              type="default"
              @click="saveFn"
              style="font-size: 12px"
            >
              保存
            </el-button>
          </div>
        </el-header>

        <!-- 标签页和画布 -->
        <el-main
          :style="{ height: `calc(100vh - ${footerHeight}px - 85px)` }"
          style="padding: 0; overflow: hidden"
        >
          <div @click.stop="hideFn">
            <el-tabs v-model="activeTab" type="card">
              <el-tab-pane
                v-for="(tab, index) in tabs"
                :key="tab.name"
                :label="displayName"
                :name="String(index)"
              >
                <div ref="drawCot" id="draw-cot">
                  <!-- 画布内容在此 -->
                </div>
              </el-tab-pane>
            </el-tabs>
            <SimuNodeDetailsModal
              :visible.sync="isModalVisible"
              :nodeData="selectedNodeData"
              @update:visible="isModalVisible = false"
              @submit="handleSubmit"
            />
            <SimulationConfigModal
              :isVisible="isSimulationConfigModalVisible"
              :configData="currentSimuConfig"
              @close="closeCreateModal"
              @submit="handleCreateOrUpdateConfig"
            />
          </div>
        </el-main>
        <el-footer
          :style="{
            height: `${footerHeight}px`,
            resize: 'vertical',
            overflow: 'auto',
            borderTop: '1px solid #ddd',
          }"
          @mousedown="startResize"
        >
          <SimulationOutput ref="simulationOutput" />
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>

<script>
import { Graph, Path } from "@antv/x6";
import "@antv/x6-vue-shape";
import SimulationOutput from "./SimulationOutput.vue";
// import DataJson from "./components/data";
// import MenuBar from "./components/menuBar";
// import Drawer from "./components/drawer";
import SimuNodeDetailsModal from "./SimuNodeDetailsModal.vue";
import SimulationConfigModal from "./SimulationConfigModal.vue";
import api from "../../api.js";
// CreateProjectDialog from "@/views/projectManagement/CreateProjectDialog.vue";
// import NodeDetailsModal from "@/views/diagramEditor/components/NodeDetailsModal.vue";
// import { Transform } from "@antv/x6-plugin-transform";
// import DialogCondition from "./components/dialog/condition.vue";
// import DialogMysql from "./components/dialog/mysql.vue";

export default {
  name: "DiagramEditor",
  components: {
    SimulationOutput,
    SimuNodeDetailsModal,
    SimulationConfigModal,
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
      footerHeight: 180, // 初始高度
      resizing: false, // 是否正在调整高度
      isSimulationConfigModalVisible: false,
      currentSimuConfig: null,
    };
  },
  props: ["diagramId", "modelId", "projectId"],
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
    // console.log(document.getElementById("draw-cot"));
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
    this.autoSaveInterval = setInterval(() => {
      this.saveFn();
    }, 180000); // 180000 毫秒 = 3 分钟
  },
  beforeDestroy() {
    // 在组件销毁前清除定时器
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  },
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
      } catch (error) {
        console.error("获取名称失败：", error);
        this.displayName = "未知名称"; // 错误时也设置默认值
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
            type: "custom-node", // 定义节点的类型
            // id: "", // 节点 ID
            name: "", // 节点名字
            diagramId: "", // 所属图的 ID
            modelId: "", // 节点对应的模型类型
            parameters: "", // 节点参数
            inputs: "", // 输入
            outputs: "", // 输出
            scripts: "", // 脚本
            signals: "", // 信号
            properties: {}, // 其他属性信息（如颜色、大小等）
            modelType: "",
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

      graph.on("node:contextmenu", ({ e, x, y, node, view }) => {
        // 右键点击一个节点触发
        console.log(e, x, y, view);
        this.showContextMenu = true;

        this.$nextTick(() => {
          // this.$refs.menuBar.setItem({ type: 'node', item: node })
          const p = graph.localToPage(x, y);
          this.$refs.menuBar.initFn(p.x, p.y, { type: "node", item: node });
        });
      });

      graph.on("edge:connected", ({ edge }) => {
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
        this.selectedNodeData = node.getData();
        const nodeId = node.id; // 获取节点的 ID
        this.handleNodeDblClick(nodeId); // 调用方法获取节点数据并显示侧边栏
      });
    },
    // end of initGraph
    async showNodeStatus(statusList) {
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
            parameters: node.data?.parameters || "", // 参数
            inputs: node.data?.inputs || "", // 输入
            outputs: node.data?.outputs || "", // 输出
            scripts: node.data?.scripts || "", // 脚本
            signals: node.data?.signals || "", // 信号
            properties: {
              category: node.data?.properties?.category,
              position: node.position, // 节点位置
              shape: node.shape, // 节点形状
              attrs: node.attrs, // 属性信息（如颜色、大小等）
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
            properties: {
              attrs: edge.attrs, // 属性信息（如颜色、线宽等）
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

    checkFn() {
      console.log("checkFn");
    },

    compileFn() {
      console.log("compileFn");
    },

    runFn() {
      console.log("runFn");
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
    startResize(event) {
      this.resizing = true;
      const startY = event.clientY;
      const startHeight = this.footerHeight;

      const onMouseMove = (e) => {
        if (!this.resizing) return; // 确保正在拖拽时调整高度
        const delta = startY - e.clientY; // 注意方向可能反了
        this.footerHeight = Math.max(100, startHeight + delta); // 更新高度，限制最小值
      };

      const onMouseUp = () => {
        this.resizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },

    closeCreateModal() {
      this.isSimulationConfigModalVisible = false;
    },
    async handleCreateOrUpdateConfig(form) {
      try {
        if (form.id) {
          console.log("提交的数据", form);
          // 更新模型
          // await this.updateProject(form);
        } else {
          console.log("提交的数据", form);
          // await this.createProject({ ...form, diagramId });
        }
      } catch (error) {
        this.$message.error(`操作失败：${error.message}`);
      } finally {
        this.closeCreateModal();
      }
    },
    async openSimulationConfig() {
      // const response = await api.queryProject(this.projectId);
      // if (response.data.status === 200) {
      //   this.currentSimuConfig = response.data.data;
      //   this.isSimulationConfigModalVisible = true;
      // }
      this.isSimulationConfigModalVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tabs {
  height: 100%; /* 确保 tabs 占满父容器 */
}

.el-tab-pane {
  height: 100%; /* 确保 tab-pane 占满 tabs */
}

#draw-cot {
  //margin-left: 20px;
  //margin-right: 5px;
  //margin-top: 10px;
  padding: 0px;
  border: 1px solid #ddd;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.2);
  background-color: #f5f5f5;
  overflow: auto;
  width: 95%;
  margin: 0 auto;
  height: calc(100vh - 300px);
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
  //stroke: #1890ff;
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

.el-footer {
  resize: vertical;
  overflow: auto;
  cursor: ns-resize;
}
</style>
