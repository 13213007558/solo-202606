import axios from "axios";
import type { Project, DevLog } from "./types";
const api = axios.create({ baseURL: "/api" });
export const projectApi = {
  getAll: () => api.get("/projects").then(r => r.data),
  getById: (id) => api.get("/projects/" + id).then(r => r.data),
  create: (data) => api.post("/projects", data).then(r => r.data),
  update: (id, data) => api.put("/projects/" + id, data).then(r => r.data),
  delete: (id) => api.delete("/projects/" + id).then(r => r.data),
};
export const logApi = {
  getAll: () => api.get("/logs").then(r => r.data),
  getByProject: (pid) => api.get("/logs/" + pid).then(r => r.data),
  create: (pid, data) => api.post("/logs/" + pid, data).then(r => r.data),
  update: (id, data) => api.put("/logs/" + id, data).then(r => r.data),
  delete: (id) => api.delete("/logs/" + id).then(r => r.data),
};
