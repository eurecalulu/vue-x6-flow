import axios from "axios";

// 创建 Axios 实例
const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加请求拦截器（可选）
apiClient.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以处理 Token 等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器（可选）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一处理响应错误
    console.error("API 响应错误：", error);
    return Promise.reject(error);
  }
);

// 定义 API 方法
export default {
  // === Diagram APIs ===
  addDiagram(data) {
    return apiClient.post("/simgui/diagram/add", data);
  },
  updateDiagram(data) {
    return apiClient.post("/simgui/diagram/update", data);
  },
  deleteDiagram(diagramId) {
    return apiClient.post(`/simgui/diagram/delete/${diagramId}`);
  },
  queryDiagram(diagramId) {
    return apiClient.post(`/simgui/diagram/query/${diagramId}`);
  },
  queryDiagramList() {
    return apiClient.post("/simgui/diagram/queryList");
  },

  // === Node APIs ===
  addNode(data) {
    return apiClient.post("/simgui/node/add", data);
  },
  updateNode(data) {
    return apiClient.post("/simgui/node/update", data);
  },
  deleteNode(nodeId) {
    return apiClient.post(`/simgui/node/delete/${nodeId}`);
  },
  deleteNodeList(diagramId) {
    return apiClient.post(`/simgui/node/deleteList/${diagramId}`);
  },
  queryNode(nodeId) {
    return apiClient.post(`/simgui/node/query/${nodeId}`);
  },
  queryNodeList(diagramId) {
    return apiClient.post(`/simgui/node/queryList/${diagramId}`);
  },
  copyNode(data) {
    return apiClient.post(`/simgui/node/copy/${data.id}`, data);
  },
  saveOrUpdateNodeList(diagramId, nodes) {
    return apiClient.post(`/simgui/node/saveOrUpdateList/${diagramId}`, nodes);
  },

  // === Line APIs ===
  addLine(data) {
    return apiClient.post("/simgui/line/add", data);
  },
  updateLine(data) {
    return apiClient.post("/simgui/line/update", data);
  },
  deleteLine(lineId) {
    return apiClient.post(`/simgui/line/delete/${lineId}`);
  },
  deleteLineList(diagramId) {
    return apiClient.post(`/simgui/line/deleteList/${diagramId}`);
  },
  queryLine(lineId) {
    return apiClient.post(`/simgui/line/query/${lineId}`);
  },
  queryLineList(diagramId) {
    return apiClient.post(`/simgui/line/queryList/${diagramId}`);
  },

  saveOrUpdateLineList(diagramId, lines) {
    return apiClient.post(`/simgui/line/saveOrUpdateList/${diagramId}`, lines);
  },

  // === Model APIs ===
  addModel(data) {
    return apiClient.post("/simgui/model/add", data);
  },
  updateModel(data) {
    return apiClient.post("/simgui/model/update", data);
  },
  deleteModel(modelId) {
    return apiClient.post(`/simgui/model/delete/${modelId}`);
  },
  queryModel(modelId) {
    return apiClient.post(`/simgui/model/query/${modelId}`);
  },
  queryModelList(data) {
    return apiClient.post("/simgui/model/queryList", data);
  },

  // === Icon APIs ===
  addIcon(data) {
    return apiClient.post("/simgui/Icon/add", data);
  },
  updateIcon(data) {
    return apiClient.post("/simgui/Icon/update", data);
  },
  deleteIcon(iconId) {
    return apiClient.post(`/simgui/Icon/delete/${iconId}`);
  },
  queryIcon(iconId) {
    return apiClient.post(`/simgui/Icon/query/${iconId}`);
  },
  queryIconList() {
    return apiClient.post("/simgui/Icon/queryList");
  },

  // === Project APIs ===
  addProject(data) {
    return apiClient.post("/simgui/project/add", data);
  },
  updateProject(data) {
    return apiClient.post("/simgui/project/update", data);
  },
  deleteProject(projectId) {
    return apiClient.post(`/simgui/project/delete/${projectId}`);
  },
  queryProject(projectId) {
    return apiClient.post(`/simgui/project/query/${projectId}`);
  },
  queryProjectList(data) {
    return apiClient.post("/simgui/project/queryList", data);
  },

  // === Category APIs ===
  addCategory(data) {
    return apiClient.post("/simgui/category/add", data);
  },
  updateCategory(data) {
    return apiClient.post("/simgui/category/update", data);
  },
  deleteCategory(categoryId) {
    return apiClient.post(`/simgui/category/delete/${categoryId}`);
  },
  queryCategory(categoryId) {
    return apiClient.post(`/simgui/category/query/${categoryId}`);
  },
  queryAllCategories() {
    return apiClient.post("/simgui/category/queryAll");
  },

  // === Connection APIs ===
  queryConnectionOfNode(nodeId) {
    return apiClient.post(`/simgui/connection/query/${nodeId}`);
  },
};
