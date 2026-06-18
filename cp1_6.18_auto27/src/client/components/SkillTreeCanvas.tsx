import React, { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { SkillNode, Position } from "../types";

interface SkillTreeCanvasProps {
  nodes: SkillNode[];
  onNodesUpdate: (nodes: SkillNode[]) => void;
  onProgressUpdate: (updates: { id: string; progress: number }[]) => void;
}

const NODE_WIDTH = 240;
const NODE_HEIGHT = 120;
const MIN_SCALE = 0.3;
const MAX_SCALE = 3;
const GRID_SIZE = 40;

const SkillTreeCanvas: React.FC<SkillTreeCanvasProps> = ({
  nodes,
  onNodesUpdate,
  onProgressUpdate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodePos, setNewNodePos] = useState<Position>({ x: 0, y: 0 });
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeDesc, setNewNodeDesc] = useState("");
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    const socket = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("node:moved", (data: { id: string; x: number; y: number }) => {
      const updated = nodes.map((n) =>
        n.id === data.id ? { ...n, x: data.x, y: data.y } : n
      );
      onNodesUpdate(updated);
    });

    socket.on("node:added", (node: SkillNode) => {
      onNodesUpdate([...nodes, node]);
    });

    socket.on("progress:updated", (data: { id: string; progress: number }) => {
      onProgressUpdate([{ id: data.id, progress: data.progress }]);
      const updated = nodes.map((n) =>
        n.id === data.id ? { ...n, progress: data.progress } : n
      );
      onNodesUpdate(updated);
    });

    return () => {
      socket.disconnect();
    };
  }, [nodes, onNodesUpdate, onProgressUpdate]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setScale((prevScale) => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, prevScale * delta));
      const scaleRatio = newScale / prevScale;

      setTranslate((prevTranslate) => ({
        x: mouseX - (mouseX - prevTranslate.x) * scaleRatio,
        y: mouseY - (mouseY - prevTranslate.y) * scaleRatio,
      }));

      return newScale;
    });
  }, []);

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest(".skill-node-card")) return;
      if (target.closest(".modal-overlay")) return;

      setIsPanning(true);
      setPanStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    },
    [translate]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        setTranslate({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }
    },
    [isPanning, panStart]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
  }, []);

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string, nodeX: number, nodeY: number) => {
      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseXInCanvas = (e.clientX - rect.left - translate.x) / scale;
      const mouseYInCanvas = (e.clientY - rect.top - translate.y) / scale;

      setDraggingNode(nodeId);
      setDragOffset({
        x: mouseXInCanvas - nodeX,
        y: mouseYInCanvas - nodeY,
      });
    },
    [translate, scale]
  );

  const handleNodeMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNode) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const mX=(e.clientX-rect.left-translate.x)/scale;
        const mY=(e.clientY-rect.top-translate.y)/scale;
        const newX=mX-dragOffset.x;
        const newY=mY-dragOffset.y;
        const updated=nodes.map(n=>n.id===draggingNode?{...n,x:newX,y:newY}:n);
        onNodesUpdate(updated);
        const now=Date.now();
        if(now-lastEmitRef.current>30){
          socketRef.current?.emit("node:drag",{nodeId:draggingNode,x:newX,y:newY});
          lastEmitRef.current=now;
        }
      });
    },
    [draggingNode,dragOffset,translate,scale,nodes,onNodesUpdate]
  );

  const handleNodeMouseUp=useCallback(()=>{
    if(draggingNode){
      const node=nodes.find(n=>n.id===draggingNode);
      if(node){
        socketRef.current?.emit("node:drag",{nodeId:draggingNode,x:node.x,y:node.y});
      }
    }
    setDraggingNode(null);
    if(rafRef.current){
      cancelAnimationFrame(rafRef.current);
      rafRef.current=null;
    }
  },[draggingNode,nodes]);

  const handleDoubleClick=useCallback(
    (e: React.MouseEvent)=>{
      const target=e.target as HTMLElement;
      if(target.closest(".skill-node-card")) return;
      const rect=canvasRef.current?.getBoundingClientRect();
      if(!rect) return;
      const x=(e.clientX-rect.left-translate.x)/scale;
      const y=(e.clientY-rect.top-translate.y)/scale;
      setNewNodePos({x,y});
      setShowAddModal(true);
      setNewNodeTitle("");
      setNewNodeDesc("");
      setNewNodeParentId(null);
    },
    [translate,scale]
  );

  const handleAddNode=async()=>{
    if(!newNodeTitle.trim()) return;
    try{
      const goalId=nodes[0]?.goal_id||"default-goal";
      const res=await axios.post("http://localhost:3001/api/tree/nodes",{
        goal_id:goalId,
        title:newNodeTitle,
        description:newNodeDesc,
        x:newNodePos.x,
        y:newNodePos.y,
        parent_id:newNodeParentId,
        progress:0,
      });
      socketRef.current?.emit("node:add",res.data);
      setShowAddModal(false);
    }catch(err){
      console.error("Failed to add node:",err);
    }
  };

  const renderConnections=()=>{
    const connections: JSX.Element[]=[];
    nodes.forEach(node=>{
      if(!node.parent_id) return;
      const parent=nodes.find(n=>n.id===node.parent_id);
      if(!parent) return;
      const sx=parent.x+NODE_WIDTH/2;
      const sy=parent.y+NODE_HEIGHT;
      const tx=node.x+NODE_WIDTH/2;
      const ty=node.y;
      const midY=(sy+ty)/2;
      const path=`M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;
      connections.push(
        <path
          key={`conn-${parent.id}-${node.id}`}
          d={path}
          stroke="rgba(124,92,252,0.5)"
          strokeWidth={2}
          fill="none"
        />
      );
    });
    return connections;
  };

  const renderProgressRing=(progress: number)=>{
    const radius=14;
    const circumference=2*Math.PI*radius;
    const offset=circumference-(progress/100)*circumference;
    return (
      <svg width={36} height={36} style={{position:"absolute",top:8,right:8}}>
        <circle cx={18} cy={18} r={radius} fill="none" stroke="rgba(124,92,252,0.2)" strokeWidth={3}/>
        <circle cx={18} cy={18} r={radius} fill="none" stroke="#7C5CFC" strokeWidth={3} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 18 18)" style={{transition:"stroke-dashoffset 0.5s ease"}}/>
        <text x={18} y={21} textAnchor="middle" fill="#FFFFFF" fontSize={10} fontWeight={600}>{progress}%</text>
      </svg>
    );
  };

  const renderGrid=()=>{
    const dots: JSX.Element[]=[];
    if(!canvasRef.current) return null;
    const rect=canvasRef.current.getBoundingClientRect();
    const cols=Math.ceil(rect.width/(GRID_SIZE*scale))+2;
    const rows=Math.ceil(rect.height/(GRID_SIZE*scale))+2;
    const startX=Math.floor(-translate.x/scale/GRID_SIZE)-1;
    const startY=Math.floor(-translate.y/scale/GRID_SIZE)-1;
    for(let i=0;i<cols;i++){
      for(let j=0;j<rows;j++){
        const x=(startX+i)*GRID_SIZE;
        const y=(startY+j)*GRID_SIZE;
        dots.push(<circle key={`dot-${x}-${y}`} cx={x} cy={y} r={1.5} fill="rgba(124,92,252,0.15)"/>);
      }
    }
    return dots;
  };

  const handleZoomIn=()=>{
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!rect){setScale(prev=>Math.min(MAX_SCALE,prev*1.2));return;}
    const cx=rect.width/2;
    const cy=rect.height/2;
    setScale(prevScale=>{
      const newScale=Math.min(MAX_SCALE,prevScale*1.2);
      const ratio=newScale/prevScale;
      setTranslate(pt=>({x:cx-(cx-pt.x)*ratio,y:cy-(cy-pt.y)*ratio}));
      return newScale;
    });
  };
  const handleZoomOut=()=>{
    const rect=canvasRef.current?.getBoundingClientRect();
    if(!rect){setScale(prev=>Math.max(MIN_SCALE,prev/1.2));return;}
    const cx=rect.width/2;
    const cy=rect.height/2;
    setScale(prevScale=>{
      const newScale=Math.max(MIN_SCALE,prevScale/1.2);
      const ratio=newScale/prevScale;
      setTranslate(pt=>({x:cx-(cx-pt.x)*ratio,y:cy-(cy-pt.y)*ratio}));
      return newScale;
    });
  };
  const handleReset=()=>{setScale(1);setTranslate({x:0,y:0});};


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
      onMouseMove={(e) => { handleCanvasMouseMove(e); handleNodeMouseMove(e); }}
      onMouseUp={() => { handleCanvasMouseUp(); handleNodeMouseUp(); }}
      onMouseLeave={() => { handleCanvasMouseUp(); handleNodeMouseUp(); }}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{position: "absolute", top: 16, left: 16, padding: "12px 16px", backgroundColor: "rgba(37,42,74,0.9)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 12, fontSize: 13, color: "#A0A4C4", lineHeight: 1.8, zIndex: 10, boxShadow: "0 0 20px rgba(124,92,252,0.1)"}}>
        <div style={{color: "#7C5CFC", fontWeight: 600, marginBottom: 4}}>操作提示</div>
        <div>滚轮缩放画布</div>
        <div>拖拽空白处平移</div>
        <div>拖拽节点移动位置</div>
        <div>双击空白处添加节点</div>
      </div>
      <div style={{position: "absolute", bottom: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", backgroundColor: "rgba(37,42,74,0.9)", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 12, zIndex: 10, boxShadow: "0 0 20px rgba(124,92,252,0.1)"}}>
        <button onClick={handleZoomOut} style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(124,92,252,0.2)", color: "#7C5CFC", fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer"}}>-</button>
        <span style={{minWidth: 50, textAlign: "center", color: "#FFFFFF", fontSize: 14, fontWeight: 500}}>{Math.round(scale * 100)}%</span>
        <button onClick={handleZoomIn} style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(124,92,252,0.2)", color: "#7C5CFC", fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer"}}>+</button>
        <button onClick={handleReset} style={{height: 32, padding: "0 12px", borderRadius: 8, backgroundColor: "rgba(124,92,252,0.2)", color: "#7C5CFC", fontSize: 13, fontWeight: 500, marginLeft: 4, border: "none", cursor: "pointer"}}>重置</button>
      </div>
      <svg style={{position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none"}}>
        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
          {renderGrid()}
          {renderConnections()}
        </g>
      </svg>
      <div style={{position: "absolute", top: 0, left: 0, transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`, transformOrigin: "0 0"}}>
        {nodes.map((node) => (
          <div
            key={node.id}
            className="skill-node-card"
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
              padding: "16px",
              backgroundColor: "#252A4A",
              border: `2px solid ${draggingNode === node.id ? "rgba(155,130,255,0.8)" : "rgba(124,92,252,0.5)"}`,
              borderRadius: 16,
              boxShadow: draggingNode === node.id ? "0 0 30px rgba(124,92,252,0.5), inset 0 0 20px rgba(124,92,252,0.1)" : "0 0 20px rgba(124,92,252,0.15)",
              cursor: draggingNode === node.id ? "grabbing" : "grab",
              transition: draggingNode === node.id ? "none" : "box-shadow 0.3s, border-color 0.3s",
              boxSizing: "border-box",
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id, node.x, node.y)}
          >
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
      {showAddModal && (
        <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100}} onClick={() => setShowAddModal(false)}>
          <div style={{backgroundColor: "#252A4A", border: "1px solid rgba(124,92,252,0.4)", borderRadius: 16, padding: 28, minWidth: 400, boxShadow: "0 0 40px rgba(124,92,252,0.3)"}} onClick={(e) => e.stopPropagation()}>
            <h3 style={{color: "#FFFFFF", fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 20}}>添加新技能节点</h3>
            <div style={{marginBottom: 16}}>
              <label style={{display: "block", color: "#A0A4C4", fontSize: 13, marginBottom: 6}}>节点标题</label>
              <input type="text" value={newNodeTitle} onChange={(e) => setNewNodeTitle(e.target.value)} placeholder="输入技能名称" style={{width: "100%", padding: "10px 14px", backgroundColor: "#1A1B2F", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box"}} />
            </div>
            <div style={{marginBottom: 16}}>
              <label style={{display: "block", color: "#A0A4C4", fontSize: 13, marginBottom: 6}}>节点描述</label>
              <textarea value={newNodeDesc} onChange={(e) => setNewNodeDesc(e.target.value)} placeholder="输入技能描述" rows={3} style={{width: "100%", padding: "10px 14px", backgroundColor: "#1A1B2F", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box", resize: "none", fontFamily: "inherit"}} />
            </div>
            <div style={{marginBottom: 24}}>
              <label style={{display: "block", color: "#A0A4C4", fontSize: 13, marginBottom: 6}}>父节点 (可选)</label>
              <select value={newNodeParentId || ""} onChange={(e) => setNewNodeParentId(e.target.value || null)} style={{width: "100%", padding: "10px 14px", backgroundColor: "#1A1B2F", border: "1px solid rgba(124,92,252,0.3)", borderRadius: 8, color: "#FFFFFF", fontSize: 14, outline: "none", boxSizing: "border-box"}}>
                <option value="">无父节点 (根节点)</option>
                {nodes.map((n) => (<option key={n.id} value={n.id}>{n.title}</option>))}
              </select>
            </div>
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
