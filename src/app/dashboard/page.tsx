"use client";
import { Plus, BookOpen, Clock } from "lucide-react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup } from "@/components/ui/field";
import { FaEdit } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const CREATE_PROJECT = gql`
  mutation CreateProject($title: String!, $idea: String) {
    createProject(title: $title, idea: $idea) { id title }
  }
`;
const GET_PROJECTS = gql`
  query GetProjects {
    projects { id title description created_at }
  }
`;
const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $title: String, $idea: String) {
    updateProject(id: $id, title: $title, idea: $idea) { id title }
  }
`;
const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) { deleteProject(id: $id) }
`;

function timeAgo(iso: string) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const CARD_COLORS = [
    { dot: "#7c6dfa", bg: "rgba(124,109,250,0.08)", border: "rgba(124,109,250,0.18)" },
    { dot: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.18)" },
    { dot: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.18)" },
    { dot: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.18)" },
    { dot: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.18)" },
];

export default function DashboardPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [idea, setIdea] = useState("");
    const [showDialog, setShowDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<any>(null);

    const { data, loading: loadingProjects } = useQuery(GET_PROJECTS);
    const [createProject, { loading }] = useMutation(CREATE_PROJECT, { refetchQueries: ["GetProjects"] });
    const [updateProject] = useMutation(UPDATE_PROJECT, { refetchQueries: ["GetProjects"] });
    const [deleteProject] = useMutation(DELETE_PROJECT, { refetchQueries: ["GetProjects"] });

    async function handleCreateProject() {
        if (!title.trim()) { toast.info("Enter a project name"); return; }
        try {
            const { data } = await createProject({ variables: { title, idea } });
            router.push(`/project/${data.createProject.id}`);
            setShowDialog(false);
            setTitle(""); setIdea("");
        } catch { toast.error("Couldn't create project"); }
    }

    async function handleDeleteProject() {
        if (!projectToDelete) return;
        try {
            await deleteProject({ variables: { id: projectToDelete.id } });
            toast.success("Project deleted");
            setDeleteDialogOpen(false);
            setProjectToDelete(null);
        } catch { toast.error("Couldn't delete project"); }
    }

    async function handleEditProject() {
        if (!editingProjectId) return;
        try {
            await updateProject({ variables: { id: editingProjectId, title, idea } });
            toast.success("Saved");
            setEditDialogOpen(false);
            setTitle(""); setIdea(""); setEditingProjectId(null);
        } catch { toast.error("Couldn't save changes"); }
    }

    const projects = data?.projects ?? [];

    return (
        <>
            <div className="space-y-14">

                {/* ── Hero ── */}
                <section className="pt-6 pb-2">
                    <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 font-mono text-[10px] uppercase tracking-widest"
                        style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", color: "var(--color-ok)" }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                        Your AI Copilot
                    </div>

                    <h1
                        className="text-6xl md:text-7xl font-black leading-[0.9] tracking-[-0.03em] mb-6"
                        style={{ color: "var(--color-content)", fontFamily: "var(--font-heading)" }}
                    >
                        Your AI copilot for
                        <br />
                        <span style={{
                            background: "linear-gradient(to right, #93c5fd, #3b82f6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            system design thinking.
                        </span>
                    </h1>

                    <p className="text-base max-w-xl leading-relaxed mt-4" style={{ color: "var(--color-content-muted)" }}>
                        Describe your product vision and watch Specify generate a complete, production-ready technical architecture.
                    </p>
                </section>

                {/* ── Projects section ── */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold" style={{ color: "var(--color-content)" }}>
                            All projects
                            {projects.length > 0 && (
                                <span
                                    className="ml-2 text-sm font-normal px-1.5 py-0.5 rounded-md"
                                    style={{ background: "rgba(124,109,250,0.1)", color: "var(--color-primary)" }}
                                >
                                    {projects.length}
                                </span>
                            )}
                        </h2>
                        <button
                            onClick={() => setShowDialog(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus size={14} />
                            New project
                        </button>
                    </div>

                    {loadingProjects ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className="rounded-2xl h-44 animate-pulse"
                                    style={{ background: "var(--color-surface-card)" }}
                                />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        /* Empty state */
                        <div
                            className="rounded-2xl p-14 text-center"
                            style={{
                                background: "var(--color-surface-card)",
                                border: "1px solid rgba(255,255,255,0.05)",
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                            >
                                <BookOpen size={22} style={{ color: "var(--color-content-soft)" }} />
                            </div>
                            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-content)" }}>
                                No projects yet
                            </h3>
                            <p className="text-sm mb-5" style={{ color: "var(--color-content-muted)" }}>
                                Create your first workspace to start designing your system.
                            </p>
                            <button
                                onClick={() => setShowDialog(true)}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Plus size={14} /> Create project
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* New card */}
                            <button
                                onClick={() => setShowDialog(true)}
                                className="group h-44 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all text-left"
                                style={{
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    background: "rgba(255,255,255,0.02)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                                }}
                            >
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ background: "rgba(124,109,250,0.12)", border: "1px solid rgba(124,109,250,0.22)" }}
                                >
                                    <Plus size={18} style={{ color: "var(--color-primary)" }} />
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
                                        New project
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: "var(--color-content-muted)" }}>
                                        Start from scratch
                                    </div>
                                </div>
                            </button>

                            {/* Project cards */}
                            {projects.map((project: any, i: number) => {
                                const colors = CARD_COLORS[i % CARD_COLORS.length];
                                return (
                                    <div
                                        key={project.id}
                                        onClick={() => router.push(`/project/${project.id}`)}
                                        className="group relative h-44 rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all"
                                        style={{
                                            background: "var(--color-surface-card)",
                                            border: `1px solid ${colors.border}`,
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                                            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${colors.border}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLElement).style.transform = "";
                                            (e.currentTarget as HTMLElement).style.boxShadow = "";
                                        }}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                                            >
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.dot }} />
                                            </div>

                                            {/* Dropdown - stop propagation */}
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                            style={{
                                                                background: "rgba(255,255,255,0.05)",
                                                                color: "var(--color-content-soft)",
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <BsThreeDotsVertical size={12} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setTitle(project.title);
                                                                setIdea(project.description || "");
                                                                setEditingProjectId(project.id);
                                                                setEditDialogOpen(true);
                                                            }}
                                                        >
                                                            <FaEdit /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setProjectToDelete(project);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                                                        >
                                                            <MdDelete /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        {/* Bottom info */}
                                        <div>
                                            <h3
                                                className="font-semibold text-sm truncate mb-1"
                                                style={{ color: "var(--color-content)" }}
                                            >
                                                {project.title}
                                            </h3>
                                            <p
                                                className="text-xs line-clamp-2 leading-relaxed mb-3"
                                                style={{ color: "var(--color-content-muted)" }}
                                            >
                                                {project.description || "No description added yet."}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} style={{ color: "var(--color-content-muted)" }} />
                                                <span className="text-[11px]" style={{ color: "var(--color-content-muted)" }}>
                                                    {timeAgo(project.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* ── Create Dialog ── */}
            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setTitle(""); setIdea(""); } }}>
                <DialogContent className="sm:max-w-[500px] p-6" style={{ background: "var(--color-surface-card)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="space-y-6">
                        <DialogHeader className="mb-2">
                            <DialogTitle className="text-xl font-bold" style={{ color: "var(--color-content)" }}>Create new project</DialogTitle>
                        </DialogHeader>
                        <FieldGroup className="space-y-5">
                            <Field className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-content-soft)" }}>Project name</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Neural Engine V2"
                                    className="h-11 px-4 text-sm"
                                    style={{ background: "rgba(255,255,255,0.02)", color: "var(--color-content)", border: "1px solid rgba(255,255,255,0.1)" }}
                                />
                            </Field>
                            <Field className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-content-soft)" }}>Project idea</Label>
                                <Input
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder="Describe what you're building…"
                                    className="h-11 px-4 text-sm"
                                    style={{ background: "rgba(255,255,255,0.02)", color: "var(--color-content)", border: "1px solid rgba(255,255,255,0.1)" }}
                                />
                            </Field>
                        </FieldGroup>
                        <DialogFooter className="mt-8">
                            <DialogClose asChild>
                                <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--color-content-soft)" }}>Cancel</button>
                            </DialogClose>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors" disabled={loading}>
                                {loading ? "Creating…" : "Create project"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) { setTitle(""); setIdea(""); setEditingProjectId(null); } }}>
                <DialogContent className="sm:max-w-[500px] p-6" style={{ background: "var(--color-surface-card)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <form onSubmit={(e) => { e.preventDefault(); handleEditProject(); }} className="space-y-6">
                        <DialogHeader className="mb-2">
                            <DialogTitle className="text-xl font-bold" style={{ color: "var(--color-content)" }}>Edit project</DialogTitle>
                        </DialogHeader>
                        <FieldGroup className="space-y-5">
                            <Field className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-content-soft)" }}>Project name</Label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-11 px-4 text-sm"
                                    style={{ background: "rgba(255,255,255,0.02)", color: "var(--color-content)", border: "1px solid rgba(255,255,255,0.1)" }}
                                />
                            </Field>
                            <Field className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-content-soft)" }}>Project idea</Label>
                                <Input
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    className="h-11 px-4 text-sm"
                                    style={{ background: "rgba(255,255,255,0.02)", color: "var(--color-content)", border: "1px solid rgba(255,255,255,0.1)" }}
                                />
                            </Field>
                        </FieldGroup>
                        <DialogFooter className="mt-8">
                            <DialogClose asChild>
                                <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--color-content-soft)" }}>Cancel</button>
                            </DialogClose>
                            <button type="submit" className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                                Save changes
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setProjectToDelete(null); }}>
                <DialogContent className="sm:max-w-[400px] p-6" style={{ background: "var(--color-surface-card)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <DialogHeader className="mb-2">
                        <DialogTitle className="text-xl font-bold text-red-400">Delete Project</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-sm leading-relaxed" style={{ color: "var(--color-content-muted)" }}>
                        Are you sure you want to delete <strong style={{ color: "var(--color-content)" }}>{projectToDelete?.title}</strong>?
                        This action cannot be undone and will permanently erase all generated specifications.
                    </div>
                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors" style={{ color: "var(--color-content-soft)" }}>Cancel</button>
                        </DialogClose>
                        <button
                            onClick={handleDeleteProject}
                            className="px-5 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors"
                        >
                            Confirm Delete
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
