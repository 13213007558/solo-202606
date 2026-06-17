
import os

content = """import { useState, useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { getSocket } from "../../services/socket";
import type { Document } from "../../types";

interface EditorPanelProps {
  document: Document | null;
  content: string;
  onChange: (content: string) => void;
  canEdit: boolean;
}

function EditorPanel({ document, content, onChange, canEdit }: EditorPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    const view = new EditorView({
      doc: content,
      extensions: [
        basicSetup,
        markdown({ base: markdownLanguage }),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged && canEdit) {
            onChange(update.state.doc.toString());
            if (document) {
              const socket = getSocket();
              socket?.emit("edit", { documentId: document._id, content: update.state.doc.toString() });
            }
          }
        }),
        EditorView.readOnly.of(!canEdit)
      ],
      parent: editorRef.current
    });
    viewRef.current = view;
    setIsReady(true);
    return () => { view.destroy(); };
  }, []);

  useEffect(() => {
    if (viewRef.current && isReady && content !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({ changes: { from: 0, to: viewRef.current.state.doc.length, insert: content } });
    }
  }, [content, isReady]);

  useEffect(() => {
    if (!document || !viewRef.current) return;
    const socket = getSocket();
    if (!socket) return;
    const handleCursorUpdate = () => {
      const cursor = viewRef.current?.state.selection.main;
      if (cursor) {
        socket.emit("cursor-update", { documentId: document._id, position: cursor.from, selection: { from: cursor.from, to: cursor.to } });
      }
    };
    viewRef.current?.addEventListener("pointerdown", handleCursorUpdate);
    return () => { viewRef.current?.removeEventListener("pointerdown", handleCursorUpdate); };
  }, [document]);

  const charCount = content.length;
  const lineCount = content.split("\n").length;

  return (<div className="editor-panel">
    <div className="panel-header">
      <h3>Editor</h3>
      <span className={`status ${canEdit ? "editable" : "readonly"}`}>
        {canEdit ? "Editable" : "Read Only"}
      </span>
    </div>
    <div ref={editorRef} className="editor-container" />
    <div className="editor-footer">
      <span>{charCount} characters</span>
      <span>{lineCount} lines</span>
    </div>
  </div>);
}

export default EditorPanel;
"""

with open("client/src/components/Editor/EditorPanel.tsx", "w") as f:
    f.write(content)
print("Done")

