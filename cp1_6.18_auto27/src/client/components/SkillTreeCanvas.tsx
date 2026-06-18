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
