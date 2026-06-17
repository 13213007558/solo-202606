import { Server, Socket } from "socket.io";

interface UserCursor {
  userId: string;
  position: number;
  selection?: { from: number; to: number };
}

interface DocumentState {
  content: string;
  cursors: Map<string, UserCursor>;
  activeUsers: Set<string>;
}

export default class CollaborationService {
  private io: Server;
  private documents: Map<string, DocumentState> = new Map();
  private socketDocumentMap: Map<string, string> = new Map();
  private socketUserMap: Map<string, string> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  joinDocument(socket: Socket, documentId: string): void {
    const userId = socket.handshake.query.userId as string || socket.id;
    this.socketDocumentMap.set(socket.id, documentId);
    this.socketUserMap.set(socket.id, userId);

    if (!this.documents.has(documentId)) {
      this.documents.set(documentId, {
        content: "",
        cursors: new Map(),
        activeUsers: new Set()
      });
    }

    socket.join(documentId);
    const state = this.documents.get(documentId)!;
    state.activeUsers.add(userId);

    this.syncDocumentContent(socket, documentId);
    this.broadcastActiveUsers(documentId);
  }

  async syncDocumentContent(socket: Socket, documentId: string): Promise<void> {
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${documentId}`);
      const document = await response.json();
      if (document) {
        const state = this.documents.get(documentId);
        if (state) state.content = document.content;
        socket.emit("document:content", { documentId, content: document.content });
      }
    } catch (error) {
      console.error("Failed to sync document content:", error);
    }
  }

  handleEdit(socket: Socket, data: { documentId: string; content: string }): void {
    const state = this.documents.get(data.documentId);
    if (!state) return;

    state.content = data.content;

    socket.to(data.documentId).emit("document:edit", {
      documentId: data.documentId,
      content: data.content,
      userId: this.socketUserMap.get(socket.id)
    });
  }

  handleCursorUpdate(socket: Socket, data: { documentId: string; position: number; selection?: { from: number; to: number } }): void {
    const state = this.documents.get(data.documentId);
    if (!state) return;

    const userId = this.socketUserMap.get(socket.id) || socket.id;
    state.cursors.set(userId, {
      userId,
      position: data.position,
      selection: data.selection
    });

    socket.to(data.documentId).emit("cursor:update", {
      documentId: data.documentId,
      userId,
      position: data.position,
      selection: data.selection
    });
  }

  leaveDocument(socket: Socket): void {
    const documentId = this.socketDocumentMap.get(socket.id);
    const userId = this.socketUserMap.get(socket.id);

    if (documentId) {
      const state = this.documents.get(documentId);
      if (state) {
        state.activeUsers.delete(userId!);
        state.cursors.delete(userId!);
      }

      this.broadcastActiveUsers(documentId);
      socket.to(documentId).emit("cursor:remove", { userId });

      this.socketDocumentMap.delete(socket.id);
    }

    this.socketUserMap.delete(socket.id);
  }

  private broadcastActiveUsers(documentId: string): void {
    const state = this.documents.get(documentId);
    if (!state) return;

    this.io.to(documentId).emit("users:update", {
      documentId,
      users: Array.from(state.activeUsers)
    });
  }
}
