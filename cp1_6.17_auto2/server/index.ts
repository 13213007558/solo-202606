import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import Document from "./models/Document";
import CollaborationService from "./services/CollaborationService";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/markdown_collab")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

const collaborationService = new CollaborationService(io);

app.get("/api/documents", async (req, res) => {
  const documents = await Document.find().sort({ updatedAt: -1 });
  res.json(documents);
});

app.get("/api/documents/:id", async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  res.json(document);
});

app.post("/api/documents", async (req, res) => {
  const { title, content, owner, status = "draft" } = req.body;
  const document = new Document({
    title,
    content: content || "# New Document\n\nStart editing here...",
    owner,
    status,
    users: [{ userId: owner, role: "owner" }],
    versions: [{
      content: content || "# New Document\n\nStart editing here...",
      timestamp: new Date()
    }]
  });
  await document.save();
  io.emit("document:created", document);
  res.json(document);
});

app.put("/api/documents/:id", async (req, res) => {
  const { title, status } = req.body;
  const document = await Document.findByIdAndUpdate(
    req.params.id,
    { title, status, updatedAt: new Date() },
    { new: true }
  );
  if (!document) return res.status(404).json({ error: "Document not found" });
  io.emit("document:updated", document);
  res.json(document);
});

app.post("/api/documents/:id/save", async (req, res) => {
  const { content } = req.body;
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  document.content = content;
  document.versions.push({ content, timestamp: new Date() });
  document.updatedAt = new Date();
  await document.save();
  res.json({ success: true, versionCount: document.versions.length });
});

app.get("/api/documents/:id/versions", async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  res.json(document.versions);
});

app.post("/api/documents/:id/restore", async (req, res) => {
  const { versionIndex } = req.body;
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  const version = document.versions[versionIndex];
  if (!version) return res.status(400).json({ error: "Version not found" });
  document.content = version.content;
  document.versions.push({ content: version.content, timestamp: new Date(), isRestore: true });
  await document.save();
  io.emit("document:content", { documentId: req.params.id, content: version.content });
  res.json({ success: true });
});

app.post("/api/documents/:id/users", async (req, res) => {
  const { userId, role } = req.body;
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  const existingUser = document.users.find(u => u.userId === userId);
  if (existingUser) existingUser.role = role;
  else document.users.push({ userId, role });
  await document.save();
  io.emit("document:permissions", { documentId: req.params.id, users: document.users });
  res.json(document.users);
});

app.delete("/api/documents/:id", async (req, res) => {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) return res.status(404).json({ error: "Document not found" });
  io.emit("document:deleted", req.params.id);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-document", (documentId) => {
    collaborationService.joinDocument(socket, documentId);
  });

  socket.on("edit", (data) => {
    collaborationService.handleEdit(socket, data);
  });

  socket.on("cursor-update", (data) => {
    collaborationService.handleCursorUpdate(socket, data);
  });

  socket.on("disconnect", () => {
    collaborationService.leaveDocument(socket);
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
