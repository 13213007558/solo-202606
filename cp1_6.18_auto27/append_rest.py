import sys
f = open("src/client/components/SkillTreeCanvas.tsx", "a", encoding="utf-8")

f.write("""
  return (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        width: "100f.write("""
  return (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundColor: "#1A1B2F",
        overflow: "hidden",
        cursor: isPanning ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={e => { handleCanvasMouseMove(e); handleNodeMouseMove(e); }}
      onMouseUp={e => { handleCanvasMouseUp(); handleNodeMouseUp(); }}
      onMouseLeave={e => { handleCanvasMouseUp(); handleNodeMouseUp(); }}
      onDoubleClick={handleDoubleClick}
    >
""")
f.write("""
      <div style={{position: "absolute", top: 16, left: 16, padding: "12px 16px", backgroundColor: "rgba(37,42,74,0.9)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 12, fontSize: 13, color: "#A0A4C4", lineHeight: 1.8, zIndex: 10, boxShadow: "0 0 20px rgba(124,92,252,0.1)"}}>
        <div style={{color: "#7C5CFC", fontWeight: 600, marginBottom: 4}}>操作提示</div>
        <div>滚轮缩放画布</div>
        <div>拖拽空白处平移</div>
        <div>拖拽节点移动位置</div>
        <div>双击空白处添加节点</div>
      </div>
""")
f.write("""
      <svg style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none"}}>
        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          {renderGrid()}
          {renderConnections()}
        </g>
      </svg>
""")
f.write("""
            <div style={{color: "#FFFFFF", fontSize: 15, fontWeight: 600, marginBottom: 6, paddingRight: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
              {node.title}
            </div>
            <div style={{color: "#A0A4C4", fontSize: 12, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical"}}>
              {node.description}
            </div>
            {renderProgressRing(node.progress)}
          </div>
        ))}
      </div>
""")
f.write("""
      {showAddModal && (
        <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100}} onClick={() => setShowAddModal(false)}>
          <div style={{backgroundColor: "#252A4A", border: "1px solid rgba(124,92,252,0.4)", borderRadius: 16, padding: 28, minWidth: 400, boxShadow: "0 0 40px rgba(124,92,252,0.3)"}} onClick={e => e.stopPropagation()}>
            <h3 style={{color: "#FFFFFF", fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 20}}>添加新技能节点</h3>
""")
f.write("""
            <div style={{display: "flex", gap: 12, justifyContent: "flex-end"}}>
              <button onClick={() => setShowAddModal(false)} style={{padding: "10px 24px", borderRadius: 10, backgroundColor: "rgba(160,164,196,0.1)", color: "#A0A4C4", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer"}}>取消</button>
              <button onClick={handleAddNode} style={{padding: "10px 24px", borderRadius: 10, backgroundColor: "#7C5CFC", color: "#FFFFFF", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 20px rgba(124,92,252,0.3)"}}>添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeCanvas;
""")
f.close()
