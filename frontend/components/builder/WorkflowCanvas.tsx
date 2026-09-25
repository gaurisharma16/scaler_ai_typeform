"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import type { LogicRule, Question } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

function QuestionNode({ data, selected }: NodeProps<Node<{ question: Question; index: number }>>) {
  const { question, index } = data;
  return (
    <div className={`min-w-[210px] rounded-xl border bg-white p-3 shadow-sm ${selected ? "border-[#FF6B5E] ring-2 ring-[#FF6B5E]/20" : "border-[#E4E1D8]"}`}>
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-[#FF6B5E]" />
      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A877D]">Question {index + 1}</p>
      <p className="mt-1 max-w-[185px] truncate text-[13px] font-semibold text-[#191919]">{question.title || "Untitled question"}</p>
      <p className="mt-1 text-[11px] text-[#8A877D]">{QUESTION_TYPE_LABELS[question.type]}</p>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-[#FF6B5E]" />
    </div>
  );
}

const nodeTypes = { question: QuestionNode };

export function WorkflowCanvas({
  questions,
  logic,
  activeId,
  onSelect,
  onMove,
}: {
  questions: Question[];
  logic: LogicRule[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onMove: (id: number, x: number, y: number) => void;
}) {
  const initialNodes = useMemo<Node[]>(() => questions.map((q, index) => ({
    id: String(q.id),
    type: "question",
    position: { x: q.canvas_x ?? 240, y: q.canvas_y ?? index * 155 + 80 },
    selected: q.id === activeId,
    data: { question: q, index },
  })), [questions, activeId]);
  const initialEdges = useMemo<Edge[]>(() => logic.map((rule) => ({
    id: String(rule.id),
    source: String(rule.from_question_id),
    target: String(rule.to_question_id),
    animated: Boolean(rule.condition_json),
    markerEnd: { type: MarkerType.ArrowClosed, color: "#FF6B5E" },
    style: { stroke: "#FF6B5E", strokeWidth: 2 },
  })), [logic]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep the canvas in sync after a question has been created or selected.
  useMemo(() => { setNodes(initialNodes); }, [initialNodes, setNodes]);
  useMemo(() => { setEdges(initialEdges); }, [initialEdges, setEdges]);

  const onNodeDragStop = useCallback((_: unknown, node: Node) => {
    onMove(Number(node.id), node.position.x, node.position.y);
  }, [onMove]);

  return (
    <div className="h-full bg-[#F5F3EF]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onSelect(Number(node.id))}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background gap={18} size={1} color="#DDD8CE" />
        <MiniMap zoomable pannable className="!bg-white !shadow-sm" />
        <Controls className="!rounded-lg !border-[#E4E1D8] !shadow-sm" />
      </ReactFlow>
      {questions.length === 0 && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[#8A877D]">Add content to create your workflow.</div>}
    </div>
  );
}

