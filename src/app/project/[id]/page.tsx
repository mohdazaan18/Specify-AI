"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Zap, RefreshCw, CheckCircle2, Loader2, XCircle, Clock, Lightbulb, ChevronDown, ChevronUp, Database, Layout, Server, Cloud } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) { id title description }
  }
`;
const GET_SECTIONS = gql`
  query GetSections($projectId: ID!) {
    specSections(projectId: $projectId) { id section_type content }
  }
`;
const UPDATE_SECTION = gql`
  mutation UpdateSection($id: ID!, $content: String) {
    updateSection(id: $id, content: $content) { id }
  }
`;
const GENERATE_SPEC = gql`
  mutation GenerateSpec($projectId: ID!) {
    generateSpec(projectId: $projectId)
  }
`;
const REGENERATE_SECTION = gql`
  mutation RegenerateSection($projectId: ID!, $sectionType: String!) {
    regenerateSection(projectId: $projectId, sectionType: $sectionType)
  }
`;
const GET_AGENT_RUNS = gql`
  query GetAgentRuns($projectId: ID!) {
    agentRuns(projectId: $projectId) {
      id section_type agent_name status created_at
    }
  }
`;

const SECTION_ORDER = ["background", "requirements", "tech stack", "method", "implementation", "milestones", "evaluation"];

function StatusDot({ status }: { status: string }) {
  const config = {
    completed: { color: "var(--color-ok)", icon: <CheckCircle2 size={11} /> },
    running: { color: "var(--color-running)", icon: <Loader2 size={11} className="animate-spin" /> },
    failed: { color: "var(--color-error)", icon: <XCircle size={11} /> },
  }[status] ?? { color: "var(--color-content-muted)", icon: <Clock size={11} /> };

  return <span style={{ color: config.color }}>{config.icon}</span>;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function TechLogo({ name }: { name: string }) {
  const [error, setError] = useState(false);
  const formattedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (error || !formattedName) {
    return (
      <div
        className="w-7 h-7 rounded-md shadow-lg flex justify-center items-center text-[10px] uppercase font-bold text-white shrink-0"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {name.substring(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={`https://cdn.simpleicons.org/${formattedName}/white`}
      alt={name}
      className="w-6 h-6 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0"
      onError={() => setError(true)}
    />
  );
}

function TechStackGrid({ data }: { data: string }) {
  let parsed: any = null;
  try {
    let raw = data;
    if (raw.includes("```json")) {
      raw = raw.split("```json")[1].split("```")[0];
    } else if (raw.includes("```")) {
      raw = raw.split("```")[1].split("```")[0];
    }
    parsed = JSON.parse(raw.trim());
  } catch {
    return (
      <div className="text-red-400 text-sm px-4 py-2 font-mono">
        Error parsing technology stack.
        <br />
        <span className="opacity-70 text-xs">{data}</span>
      </div>
    );
  }

  const categories = [
    { key: "frontend", label: "Frontend App", icon: <Layout size={13} />, color: "#38bdf8" },
    { key: "backend", label: "Backend Core", icon: <Server size={13} />, color: "#38bdf8" },
    { key: "database", label: "Databases & Cache", icon: <Database size={13} />, color: "#3b82f6" },
    { key: "deployment", label: "Deployment & Infra", icon: <Cloud size={13} />, color: "#3b82f6" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full pt-4">
      {categories.map((c) => {
        // Find best matching key case-insensitively
        const actualKey = Object.keys(parsed).find(k => k.toLowerCase().includes(c.key.toLowerCase()));
        let items: string[] = actualKey ? Array.isArray(parsed[actualKey]) ? parsed[actualKey] : [String(parsed[actualKey])] : [];

        return (
          <div
            key={c.key}
            className="flex flex-col gap-4 p-5 rounded-2xl relative overflow-hidden group"
            style={{
              background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4))",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Subtle glow effect on hover */}
            <div className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-2xl" style={{ background: c.color }} />

            <div className="flex items-center gap-2 relative z-10" style={{ color: c.color }}>
              {c.icon} <span className="text-[12px] font-bold uppercase tracking-widest">{c.label}</span>
            </div>

            <div className="flex-1 relative z-10">
              {items.length === 0 ? (
                <span className="text-[13px] text-white/30 italic">Not specified</span>
              ) : (
                <div className="flex flex-col gap-3.5 mt-2">
                  {items.map((techItem: any) => {
                    const techName = typeof techItem === "string" ? techItem : techItem.name;
                    const techReason = typeof techItem === "string" ? null : techItem.reason;
                    return (
                      <HoverCard key={techName} openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-3.5 p-2 -mx-2 rounded-xl transition-all hover:bg-white/5 cursor-help w-fit">
                            <TechLogo name={techName} />
                            <span className="text-[14px] font-semibold tracking-wide text-white/95">{techName}</span>
                          </div>
                        </HoverCardTrigger>
                        {techReason && (
                          <HoverCardContent className="w-72 bg-black/90 border border-white/10 shadow-2xl backdrop-blur-xl p-5 z-[100] rounded-2xl" side="right" sideOffset={15}>
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <TechLogo name={techName} />
                              <span className="font-bold text-[15px] tracking-wide text-white">{techName}</span>
                            </div>
                            <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                              {techReason}
                            </p>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TechStackPreview({ data }: { data: string }) {
  let parsed: any = null;
  try {
    let raw = data;
    if (raw.includes("```json")) {
      raw = raw.split("```json")[1].split("```")[0];
    } else if (raw.includes("```")) {
      raw = raw.split("```")[1].split("```")[0];
    }
    parsed = JSON.parse(raw.trim());
  } catch {
    return <div className="text-[10px] text-red-400">Error rendering preview</div>;
  }

  const allIcons: any[] = [];
  Object.values(parsed).forEach((val: any) => {
    if (Array.isArray(val)) allIcons.push(...val);
    else if (val) allIcons.push(val);
  });

  const displayIcons = allIcons.slice(0, 8); // show max 8 logos

  if (displayIcons.length === 0) {
    return <span className="text-xs text-white/50">No tools found</span>;
  }

  return (
    <div className="flex items-center justify-center flex-wrap gap-2.5">
      {displayIcons.map((techItem: any) => {
        const techName = typeof techItem === "string" ? techItem : techItem.name;
        const techReason = typeof techItem === "string" ? null : techItem.reason;
        return (
          <HoverCard key={techName} openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div className="cursor-help transition-transform hover:scale-110 p-1">
                <TechLogo name={techName} />
              </div>
            </HoverCardTrigger>
            {techReason && (
              <HoverCardContent className="w-64 bg-black/90 border border-white/10 shadow-2xl backdrop-blur-xl p-4 z-[100] rounded-2xl" side="left" sideOffset={15}>
                <div className="flex items-center gap-2.5 mb-2">
                  <TechLogo name={techName} />
                  <span className="font-bold text-sm tracking-wide text-white">{techName}</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  {techReason}
                </p>
              </HoverCardContent>
            )}
          </HoverCard>
        );
      })}
    </div>
  );
}

export default function ProjectWorkspace() {
  const params = useParams();
  const projectId = params.id as string;
  const [ideaExpanded, setIdeaExpanded] = useState(true);
  const [expandedSection, setExpandedSection] = useState<any>(null);
  const [expandedTechStack, setExpandedTechStack] = useState<boolean>(false);

  const [generateSpec, { loading: generating }] = useMutation(GENERATE_SPEC, {
    refetchQueries: ["GetSections", "GetAgentRuns"],
  });

  const [regenerateSection, { loading: regeneratingSection }] = useMutation(REGENERATE_SECTION, {
    refetchQueries: ["GetSections", "GetAgentRuns"],
  });

  const { data: projectData } = useQuery(GET_PROJECT, { variables: { id: projectId } });
  const { data: sectionsData, loading } = useQuery(GET_SECTIONS, { variables: { projectId } });
  const { data: agentRunsData, startPolling, stopPolling } = useQuery(GET_AGENT_RUNS, { variables: { projectId } });
  const [updateSection] = useMutation(UPDATE_SECTION);

  const rawRuns: any[] = agentRunsData?.agentRuns ?? [];
  const latestRunsMap = new Map();
  rawRuns.forEach((r) => latestRunsMap.set(r.section_type.toLowerCase(), r));
  const runs = Array.from(latestRunsMap.values()).sort((a: any, b: any) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const hasRunning = runs.some((r) => r.status === "running");
  const completedCount = runs.filter((r) => r.status === "completed").length;
  const allDone = runs.length === 7 && runs.every((r) => r.status === "completed");

  useEffect(() => {
    if (hasRunning || generating || regeneratingSection) startPolling(3000);
    else stopPolling();
  }, [hasRunning, generating, regeneratingSection, startPolling, stopPolling]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={22} className="animate-spin mx-auto mb-3" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm" style={{ color: "var(--color-content-muted)" }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  const project = projectData?.project;
  const sections: any[] = sectionsData?.specSections ?? [];

  // Sort sections by SECTION_ORDER
  const sorted = [...sections].sort((a, b) => {
    const ai = SECTION_ORDER.indexOf(a.section_type.toLowerCase());
    const bi = SECTION_ORDER.indexOf(b.section_type.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const mainSections = sorted.filter(s => s.section_type.toLowerCase() !== "tech stack");

  const techStackSection = sorted.find(s => s.section_type.toLowerCase() === "tech stack");
  const techStackRun = runs.find(r => r.section_type.toLowerCase() === "tech stack");

  return (
    <div className="flex h-full overflow-hidden">

      {/* ════════════ MAIN CANVAS ════════════ */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(124,109,250,0.15) transparent" }}
      >
        {/* ── Page header ── */}
        <div
          className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between gap-4"
          style={{
            background: "rgba(10,10,10,0.75)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              {hasRunning && (
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(124,109,250,0.12)", color: "var(--color-primary)" }}
                >
                  <Loader2 size={9} className="animate-spin" />
                  Generating…
                </span>
              )}
              {allDone && (
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(52,211,153,0.1)", color: "var(--color-ok)" }}
                >
                  <CheckCircle2 size={9} />
                  Spec complete
                </span>
              )}
            </div>
            <h1
              className="text-xl font-bold truncate"
              style={{ color: "var(--color-content)", fontFamily: "var(--font-heading)" }}
            >
              {project?.title}
            </h1>
          </div>

          <button
            onClick={() => generateSpec({ variables: { projectId } })}
            disabled={generating}
            className="btn-primary shrink-0 flex items-center gap-2"
          >
            {generating
              ? <><Loader2 size={13} className="animate-spin" /> Generating</>
              : <><Zap size={13} /> Generate Spec</>
            }
          </button>
        </div>

        <div className="px-8 py-7 space-y-5">

          {/* ── Idea Section ── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--color-surface-card)",
              border: "1px solid rgba(124,109,250,0.12)",
            }}
          >
            <button
              className="w-full flex items-center justify-between px-5 py-4 transition-all"
              onClick={() => setIdeaExpanded((v) => !v)}
              style={{ color: "var(--color-content)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)" }}
                >
                  <Lightbulb size={13} style={{ color: "#fbbf24" }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--color-content)" }}>
                  Project Idea
                </span>
              </div>
              {ideaExpanded
                ? <ChevronUp size={15} style={{ color: "var(--color-content-muted)" }} />
                : <ChevronDown size={15} style={{ color: "var(--color-content-muted)" }} />
              }
            </button>

            {ideaExpanded && (
              <div
                className="px-5 pb-5"
                style={{ borderTop: "1px solid rgba(124,109,250,0.07)" }}
              >
                <p className="text-[11px] mb-2 pt-4" style={{ color: "var(--color-content-muted)" }}>
                  Edit your project idea below. This is used as context when generating the spec.
                </p>
                <textarea
                  key={project?.description}
                  defaultValue={project?.description ?? ""}
                  rows={4}
                  placeholder="Describe your project idea here…"
                  className="w-full bg-transparent outline-none resize-none text-sm leading-relaxed"
                  style={{ color: "var(--color-content)" }}
                />
              </div>
            )}
          </div>

          {/* ── Section tabs ── */}
          <div className="flex gap-2 flex-wrap">
            {SECTION_ORDER.filter(s => s !== "tech stack").map((tab) => {
              const sec = mainSections.find(s => s.section_type.toLowerCase() === tab);
              const done = sec && sec.content?.trim();
              return (
                <button
                  key={tab}
                  className="text-xs px-3 py-1.5 rounded-lg capitalize transition-all font-medium"
                  style={{
                    background: done ? "rgba(52,211,153,0.08)" : "rgba(124,109,250,0.06)",
                    border: done ? "1px solid rgba(52,211,153,0.18)" : "1px solid rgba(124,109,250,0.1)",
                    color: done ? "var(--color-ok)" : "var(--color-content-soft)",
                  }}
                  onClick={() => {
                    document.getElementById(`section-${tab}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* ── Empty state ── */}
          {mainSections.length === 0 && (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: "var(--color-surface-card)",
                border: "1.5px dashed rgba(124,109,250,0.12)",
              }}
            >
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--color-content)" }}>
                No spec generated yet
              </h3>
              <p className="text-sm" style={{ color: "var(--color-content-muted)" }}>
                Click "Generate Spec" to let the AI agents build your full architecture document.
              </p>
            </div>
          )}

          {/* ── Spec sections ── */}
          {mainSections.map((section: any) => {
            const run = runs.find(r => r.section_type.toLowerCase() === section.section_type.toLowerCase());
            const isRunning = run?.status === "running";

            return (
              <div
                id={`section-${section.section_type.toLowerCase()}`}
                key={section.id}
                className="rounded-xl overflow-hidden shadow-2xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: isRunning
                    ? "1px solid rgba(59,130,246,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: isRunning ? "0 0 32px rgba(59,130,246,0.08)" : "0 8px 32px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Card header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: "1px solid rgba(124,109,250,0.07)" }}
                >
                  <div className="flex items-center gap-2.5">
                    {run && <StatusDot status={run.status} />}
                    <span
                      className="capitalize text-sm font-semibold"
                      style={{ color: "var(--color-content)" }}
                    >
                      {section.section_type}
                    </span>
                    {isRunning && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                        style={{ background: "rgba(124,109,250,0.1)", color: "var(--color-primary)" }}
                      >
                        Writing…
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => regenerateSection({ variables: { projectId, sectionType: section.section_type } })}
                    disabled={regeneratingSection || isRunning}
                    className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "var(--color-content-soft)",
                    }}
                    onMouseEnter={(e) => {
                      if (regeneratingSection || isRunning) return;
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-content)";
                    }}
                    onMouseLeave={(e) => {
                      if (regeneratingSection || isRunning) return;
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.color = "var(--color-content-soft)";
                    }}
                  >
                    <RefreshCw size={10} className={isRunning ? "animate-spin" : ""} />
                    {isRunning ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  {isRunning ? (
                    <div
                      className="p-5 flex flex-col gap-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.015)" }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Loader2 size={14} className="animate-spin text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Synthesizing {section.section_type.toLowerCase()}…</span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-blue-500/10 animate-pulse" />
                      <div className="h-3 w-4/5 rounded-full bg-blue-500/10 animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="h-3 w-2/3 rounded-full bg-blue-500/10 animate-pulse" style={{ animationDelay: "300ms" }} />
                    </div>
                  ) : section.content ? (
                    <div
                      className="relative cursor-pointer group rounded-xl overflow-hidden"
                      onClick={() => setExpandedSection(section)}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-hidden px-2 pt-2"
                        style={{ color: "var(--color-content)", fontFamily: "var(--font-sans)" }}>
                        {section.content}
                      </div>

                      <div
                        className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ background: "linear-gradient(transparent, rgba(12,12,12,1))" }}
                      >
                        <span className="text-[11px] font-semibold tracking-wide px-4 py-1.5 rounded-full uppercase shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          style={{ background: "rgba(255,255,255,0.12)", color: "white", backdropFilter: "blur(8px)" }}>
                          Read & Edit
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm py-4 text-center opacity-50" style={{ color: "var(--color-content-muted)" }}>
                      No content generated yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* ════════════ AGENT TIMELINE ════════════ */}
      <aside
        className="w-[280px] shrink-0 hidden lg:flex flex-col relative z-10"
        style={{
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(10,10,10,0.4)",
          backdropFilter: "blur(16px)",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <div className="flex flex-col min-h-full">
          {/* Tech Stack Widget - TOP */}
          <div className="px-6 pt-7 pb-6 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-[11px] font-bold tracking-widest uppercase mb-4 flex items-center justify-between" style={{ color: "var(--color-content)" }}>
              <span>Proposed Stack</span>
            </h3>

            {techStackRun?.status === "running" ? (
              <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <Loader2 size={14} className="animate-spin text-blue-400 shrink-0" />
                <span className="text-[11px] text-blue-400 font-medium">Curating technologies...</span>
              </div>
            ) : techStackSection?.content && techStackSection.content.length > 5 ? (
              <div
                className="w-full text-left p-4 rounded-2xl transition-all group overflow-hidden relative"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
              >
                <div className="absolute inset-0 bg-blue-500/opacity-0 group-hover:bg-blue-500/5 transition-all duration-300 pointer-events-none" />
                <TechStackPreview data={techStackSection.content} />
                <button
                  onClick={() => setExpandedTechStack(true)}
                  className="w-full mt-4 py-2 rounded-xl text-center text-[10px] uppercase tracking-widest font-bold transition-all duration-300 text-white/40 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10"
                >
                  View Architecture
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl text-center text-[11px] text-white/30" style={{ background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(255,255,255,0.08)" }}>
                Awaiting Generation<br />(Requires completion of prior steps)
              </div>
            )}
          </div>

          {/* Timeline Header - STICKY BELOW STACK */}
          <div
            className="sticky top-0 px-6 py-4 z-20"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              background: "rgba(10,10,10,0.8)",
              backdropFilter: "blur(12px)"
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "var(--color-content)" }}>
                Timeline
              </span>
              {hasRunning && (
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  <Loader2 size={10} className="animate-spin" /> Active
                </span>
              )}
            </div>

            <div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(completedCount / 7) * 100}%`,
                    background: "linear-gradient(90deg, #93c5fd, #3b82f6)",
                  }}
                />
              </div>
              <p className="text-[10px] mt-2 font-medium" style={{ color: "var(--color-content-muted)" }}>
                {completedCount} of 7 steps completed
              </p>
            </div>
          </div>

          {/* Timeline List - SHORTER UI */}
          <div className="flex-1 px-6 py-4 flex flex-col">
            <div className="relative">
              {/* Vertical line connecting nodes */}
              <div
                className="absolute left-[6px] top-3 bottom-3 w-px"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />

              <div className="space-y-0.5 mt-1">
                {SECTION_ORDER.map((type, idx) => {
                  const run = runs.find((r) => r.section_type.toLowerCase() === type);
                  const isActive = run?.status === "running";
                  const isDone = run?.status === "completed";
                  const isPending = !run || run.status === "pending";

                  return (
                    <div key={type} className={`relative flex items-start gap-3.5 py-1.5 pl-0 transition-opacity ${isPending ? "opacity-30" : "opacity-100"}`}>
                      {/* Node Indicator */}
                      <div
                        className="shrink-0 w-[13px] h-[13px] rounded-full flex items-center justify-center z-10 mt-[3px]"
                        style={{
                          background: "#0a0a0a",
                          border: isDone
                            ? "1.5px solid #10b981"
                            : isActive
                              ? "1.5px solid #3b82f6"
                              : "1.5px solid rgba(255,255,255,0.15)",
                          boxShadow: isActive ? "0 0 12px rgba(59,130,246,0.3)" : "none"
                        }}
                      >
                        {isActive && <div className="w-[3px] h-[3px] rounded-full bg-blue-500 animate-pulse" />}
                        {isDone && <div className="w-[5px] h-[5px] rounded-full bg-emerald-500" />}
                        {isPending && <div className="w-[3px] h-[3px] rounded-full bg-white/20" />}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[12px] font-bold capitalize truncate"
                            style={{ color: "var(--color-content)" }}
                          >
                            {type}
                          </span>
                        </div>
                        <span
                          className="text-[10px] font-medium block mt-0"
                          style={{ color: isActive ? "#93c5fd" : "var(--color-content-muted)" }}
                        >
                          {isDone ? "Completed" : isActive ? "AI generating…" : "Pending execution"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════ EDIT MODAL ════════════ */}
      {expandedSection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
          onClick={() => setExpandedSection(null)}
        >
          <div
            className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            style={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-7 py-5" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-lg font-bold capitalize tracking-wide text-white">{expandedSection.section_type}</h2>
              <button onClick={() => setExpandedSection(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <XCircle size={18} />
              </button>
            </div>
            <textarea
              autoFocus
              defaultValue={expandedSection.content ?? ""}
              className="w-full flex-1 bg-transparent outline-none resize-none px-8 py-7 text-[15px] leading-relaxed"
              style={{ color: "var(--color-content)", fontFamily: "var(--font-sans)", scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}
              onBlur={(e) => {
                updateSection({ variables: { id: expandedSection.id, content: e.target.value } });
              }}
            />
          </div>
        </div>
      )}

      {/* ════════════ TECH STACK FULL MODAL ════════════ */}
      {expandedTechStack && techStackSection && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(24px)" }}
          onClick={() => setExpandedTechStack(false)}
        >
          <div
            className="w-full max-w-5xl flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300"
            style={{
              background: "linear-gradient(180deg, #121212 0%, #050505 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)"
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header Area with glowing orb */}
            <div className="flex items-center justify-between px-10 py-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-[100px] pointer-events-none" style={{ background: "radial-gradient(circle at 10% -20px, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center drop-shadow-lg" style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.05))", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <Zap size={22} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-1 shadow-black drop-shadow-md">Architecture Recommendations</h2>
                  <p className="text-[14px] text-white/50 font-medium tracking-wide">AI-curated premium technology stack for this project</p>
                </div>
              </div>
              <button
                onClick={() => setExpandedTechStack(false)}
                className="relative z-10 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all transform hover:rotate-90 duration-300"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div
              className="flex-1 px-8 pb-10"
            >
              <TechStackGrid data={techStackSection.content} />
            </div>

            {/* Footer */}
            <div className="px-10 py-5 flex justify-end" style={{ background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <button onClick={() => setExpandedTechStack(false)} className="px-6 py-2 rounded-xl text-sm font-bold tracking-wide text-white transition-all" style={{ background: "rgba(255,255,255,0.08)" }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
