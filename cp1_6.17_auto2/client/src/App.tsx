import { useState, useEffect, useCallback } from "react";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import MainContent from "./components/Layout/MainContent";
import KanbanBoard from "./components/Kanban/KanbanBoard";
import { initSocket } from "./services/socket";
import type { Document, DocumentUser } from "../types";

const CURRENT_USER_ID = "user1";
type ViewMode = "editor" | "kanban";

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    const socket = initSocket(CURRENT_USER_ID);
    socket.on("document:created", (doc: Document) => {
      setDocuments(prev => [doc, ...prev]);
      showToast("Document created", "success");
    });
    socket.on("document:updated", (doc: Document) => {
      setDocuments(prev => prev.map(d => d._id === doc._id ? doc : d));
      if (currentDocument?._id === doc._id) setCurrentDocument(doc);
    });
    socket.on("document:deleted", (docId: string) => {
      setDocuments(prev => prev.filter(d => d._id !== docId));
      if (currentDocument?._id === docId) setCurrentDocument(null);
      showToast("Document deleted", "success");
    });
    socket.on("users:update", (data: { documentId: string; users: string[] }) => {
      if (currentDocument?._id === data.documentId) setActiveUsers(data.users);
    });
    return () => { socket.disconnect(); };
  }, [currentDocument?._id]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      const docs = await response.json();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectDocument = useCallback((doc: Document) => {
    setCurrentDocument(doc);
    setViewMode("editor");
  }, []);

  const handleCreateDocument = async () => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Document", owner: CURRENT_USER_ID })
      });
      const doc = await response.json();
      setDocuments(prev => [doc, ...prev]);
      setCurrentDocument(doc);
      setViewMode("editor");
      showToast("Document created", "success");
    } catch (error) {
      showToast("Failed to create document", "error");
    }
  };

  const handleSaveDocument = async () => {
    if (!currentDocument) return;
    try {
      await fetch(`/api/documents/${currentDocument._id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentDocument.content })
      });
      showToast("Document saved", "success");
    } catch (error) {
      showToast("Failed to save document", "error");
    }
  };

  const handleUpdateDocument = async (docId: string, updates: Partial<Document>) => {
    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const doc = await response.json();
      setDocuments(prev => prev.map(d => d._id === doc._id ? doc : d));
      if (currentDocument?._id === doc._id) setCurrentDocument(doc);
    } catch (error) {
      showToast("Failed to update document", "error");
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      showToast("Document deleted", "success");
    } catch (error) {
      showToast("Failed to delete document", "error");
    }
  };

  const handleAddUser = async (docId: string, userId: string, role: DocumentUser["role"]) => {
    try {
      await fetch(`/api/documents/${docId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role })
      });
      showToast("User added", "success");
    } catch (error) {
      showToast("Failed to add user", "error");
    }
  };

  const getUserRole = (doc: Document): DocumentUser["role"] => {
    const user = doc.users.find(u => u.userId === CURRENT_USER_ID);
    return user?.role || "viewer";
  };

  const canEdit = (doc: Document): boolean => {
    const role = getUserRole(doc);
    return role === "owner" || role === "editor";
  };

  return (<div className="app-container">
    <Header onViewModeChange={setViewMode} currentMode={viewMode} onCreateDocument={handleCreateDocument} onSaveDocument={handleSaveDocument} hasDocument={!!currentDocument}/>
    <Sidebar documents={documents} currentDocument={currentDocument} onSelectDocument={handleSelectDocument} loading={loading} viewMode={viewMode}/>
    <main className="main-area">
      {loading ? (<div className="skeleton-loader"><div className="skeleton skeleton-lg"></div><div className="skeleton skeleton-md"></div><div className="skeleton skeleton-sm"></div></div>) : viewMode === "kanban" ? (<KanbanBoard documents={documents} onMoveDocument={(docId, status) => handleUpdateDocument(docId, { status })} onSelectDocument={handleSelectDocument} canEdit={canEdit}/>) : (<MainContent document={currentDocument} onContentChange={(content) => currentDocument && setCurrentDocument({ ...currentDocument, content })} canEdit={currentDocument ? canEdit(currentDocument) : false} activeUsers={activeUsers} onSave={handleSaveDocument} onShowToast={showToast}/>)}
    </main>
    {toast && (<div className={`toast toast-${toast.type}`}>{toast.message}</div>)}
  </div>);
}

export default App;
