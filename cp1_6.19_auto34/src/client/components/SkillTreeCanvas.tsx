import { useState, useRef, useCallback, useEffect } from 'react';

interface SkillNode {
  id: string;
  goal_id: string;
  title: string;
  x: number;
  y: number;
  progress: number;
  parent_id: string | null;
  created_at: string;
}

interface Props {
  nodes: SkillNode[];
  onNodeMove: (nodeId: string, x: number, y: number) => void;
  onAddNode: (title: string, parentId: string | null) => void;
}

interface DragState {
  type: 'canvas' | 'node';
  nodeId?: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
}

function ProgressRing({ progress, size }: { progress: number; size: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(124,92,252,0.15)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#7C5CFC"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
      />
    </svg>
  );
}

function getBezierPath(
  fromX: number, fromY: number,
  toX: number, toY: number
): string {
  const nodeW = 140;
  const nodeH = 70;
  const sx = fromX + nodeW / 2;
  const sy = fromY + nodeH;
  const ex = toX + nodeW / 2;
  const ey = toY;
  const midY = (sy + ey) / 2;
  return `M ${sx} ${sy} C ${sx} ${midY}, ${ex} ${midY}, ${ex} ${ey}`;
}

export default function SkillTreeCanvas({ nodes, onNodeMove, onAddNode }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newParent, setNewParent] = useState<string>('');

  const animFrameRef = useRef<number>(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (addMode) return;
      const target = e.target as HTMLElement;
      const nodeEl = target.closest('[data-node-id]');

      if (nodeEl) {
        const nodeId = nodeEl.getAttribute('data-node-id')!;
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;
        setDragState({
          type: 'node',
          nodeId,
          startX: e.clientX,
          startY: e.clientY,
          origX: node.x,
          origY: node.y,
        });
      } else {
        setDragState({
          type: 'canvas',
          startX: e.clientX,
          startY: e.clientY,
          origX: offset.x,
          origY: offset.y,
        });
      }
      e.preventDefault();
    },
    [nodes, offset, addMode]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;

      if (dragState.type === 'canvas') {
        setOffset({ x: dragState.origX + dx, y: dragState.origY + dy });
      } else if (dragState.type === 'node' && dragState.nodeId) {
        const newX = dragState.origX + dx / scale;
        const newY = dragState.origY + dy / scale;
        pendingRef.current = { x: newX, y: newY };
        if (!animFrameRef.current) {
          animFrameRef.current = requestAnimationFrame(() => {
            if (pendingRef.current && dragState.nodeId) {
              onNodeMove(dragState.nodeId, pendingRef.current.x, pendingRef.current.y);
            }
            animFrameRef.current = 0;
          });
        }
      }
    },
    [dragState, scale, onNodeMove]
  );

  const handleMouseUp = useCallback(() => {
    if (dragState?.type === 'node' && dragState.nodeId && pendingRef.current) {
      onNodeMove(dragState.nodeId, pendingRef.current.x, pendingRef.current.y);
    }
    pendingRef.current = null;
    setDragState(null);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, [dragState, onNodeMove]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(3, Math.max(0.2, prev * delta)));
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleAddNodeSubmit = () => {
    if (!newTitle.trim()) return;
    onAddNode(newTitle.trim(), newParent || null);
    setNewTitle('');
    setNewParent('');
    setAddMode(false);
  };

  return (
    <div className="tree-canvas-wrapper" style={{ position: 'relative' }}>
      <div
        ref={wrapperRef}
        style={{ width: '100%', height: '100%', cursor: dragState?.type === 'canvas' ? 'grabbing' : addMode ? 'crosshair' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="tree-viewport"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
        >
          <svg className="tree-connections-svg" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
            {nodes.map((node) => {
              if (!node.parent_id) return null;
              const parent = nodes.find((n) => n.id === node.parent_id);
              if (!parent) return null;
              return (
                <path
                  key={`edge-${node.id}`}
                  d={getBezierPath(parent.x, parent.y, node.x, node.y)}
                  stroke="#7C5CFC"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.6"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`tree-node ${dragState?.type === 'node' && dragState.nodeId === node.id ? 'dragging' : ''}`}
              style={{ left: node.x, top: node.y }}
            >
              <ProgressRing progress={node.progress} size={40} />
              <span className="tree-node-title">{node.title}</span>
              <span className="tree-node-progress-text">{Math.round(node.progress)}%</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 8 }}>
        {!addMode ? (
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={() => setAddMode(true)}>
            + 添加技能节点
          </button>
        ) : (
          <div className="card" style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="技能名称"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNodeSubmit()}
              style={{
                padding: '6px 10px',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(124,92,252,0.2)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 12,
                outline: 'none',
                width: 140,
              }}
            />
            <select
              value={newParent}
              onChange={(e) => setNewParent(e.target.value)}
              style={{
                padding: '6px 10px',
                background: 'var(--bg-primary)',
                border: '1px solid rgba(124,92,252,0.2)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 12,
                outline: 'none',
                maxWidth: 120,
              }}
            >
              <option value="">无父节点</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={handleAddNodeSubmit}>
              确认
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => { setAddMode(false); setNewTitle(''); setNewParent(''); }}>
              取消
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
