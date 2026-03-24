import { supabase } from "@/lib/supabase";
import { runBackgroundAgent } from "@/agents/BackgroundAgent";
import { runSectionAgent } from "@/agents/runSectionAgent";
import { runTechStackAgent } from "@/agents/runTechStackAgent";

export const resolvers = {
    Mutation: {
        createProject: async (
            _: any,
            { title, idea }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data: project, error } = await supabase
                .from("projects")
                .insert({
                    title,
                    description: idea,
                    user_id: context.user.id,
                })
                .select()
                .single();

            if (error) throw error;

            const sections = [
                "background",
                "requirements",
                "tech stack",
                "method",
                "implementation",
                "milestones",
                "evaluation",
            ];

            await supabase.from("spec_sections").insert(
                sections.map((section) => ({
                    project_id: project.id,
                    section_type: section,
                    content: "",
                }))
            );

            return project;
        },
        updateProject: async (
            _: any,
            { id, title, idea }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data, error } = await supabase
                .from("projects")
                .update({
                    title,
                    description: idea,
                })
                .eq("id", id)
                .eq("user_id", context.user.id)
                .select()
                .single();

            if (error) throw error;

            return data;
        },
        deleteProject: async (
            _: any,
            { id }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", id)
                .eq("user_id", context.user.id);

            if (error) throw error;

            return true;
        },
        updateSection: async (
            _: any,
            { id, content }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data, error } = await supabase
                .from("spec_sections")
                .update({
                    content,
                    updated_at: new Date()
                })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;

            return data;
        },
        generateBackground: async (
            _: any,
            { projectId }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            // 1️⃣ Load project idea safely

            const { data: project, error: projectError } = await supabase
                .from("projects")
                .select("description")
                .eq("id", projectId)
                .single();

            if (projectError || !project) {
                throw new Error("Project not found");
            }

            const idea = project.description ?? "";


            // 2️⃣ Run Background agent

            const output = await runBackgroundAgent(idea);


            // 3️⃣ Find section safely (case-insensitive lookup)

            let { data: section } = await supabase
                .from("spec_sections")
                .select("id")
                .eq("project_id", projectId)
                .ilike("section_type", "Background")
                .maybeSingle();


            // 4️⃣ If section missing → create it automatically

            if (!section) {

                const { data: newSection, error: insertError } =
                    await supabase
                        .from("spec_sections")
                        .insert({
                            project_id: projectId,
                            section_type: "Background",
                            content: "",
                        })
                        .select()
                        .single();

                if (insertError) {
                    throw insertError;
                }

                section = newSection;
            }


            // 5️⃣ Update section content

            if (!section) throw new Error("Section not found after upsert");

            const { error: updateError } = await supabase
                .from("spec_sections")
                .update({
                    content: output,
                    updated_at: new Date(),
                })
                .eq("id", section.id);

            if (updateError) {
                throw updateError;
            }


            // 6️⃣ Log agent execution

            await supabase
                .from("agent_runs")
                .insert({
                    project_id: projectId,
                    section_type: "Background",
                    agent_name: "BackgroundAgent",
                    status: "completed",
                    output: { text: output },
                });


            return true;
        },
        generateSpec: async (
            _: any,
            { projectId }: any,
            context: any
        ) => {
            if (!context.user) {
                throw new Error("Not authenticated");
            }

            // Fetch project idea
            const { data: project } = await supabase
                .from("projects")
                .select("description")
                .eq("id", projectId)
                .single();

            if (!project) throw new Error("Project not found");

            const idea = project.description ?? "";

            // STEP 1 — Background
            await supabase.from("agent_runs").insert({
                project_id: projectId,
                section_type: "Background",
                agent_name: "BackgroundAgent",
                status: "running",
                output: {},
            });

            const background = await runSectionAgent(idea, "Background");

            // Save Background section
            const { data: backgroundRow } = await supabase
                .from("spec_sections")
                .select("id")
                .eq("project_id", projectId)
                .ilike("section_type", "Background")
                .maybeSingle();

            if (backgroundRow) {
                await supabase
                    .from("spec_sections")
                    .update({ content: background, updated_at: new Date() })
                    .eq("id", backgroundRow.id);
            }

            await supabase
                .from("agent_runs")
                .update({ status: "completed", output: { text: background } })
                .eq("project_id", projectId)
                .eq("section_type", "Background");

            // STEP 2 — Requirements (depends on Background)
            await supabase.from("agent_runs").insert({
                project_id: projectId,
                section_type: "Requirements",
                agent_name: "RequirementsAgent",
                status: "running",
                output: {},
            });

            const requirements = await runSectionAgent(
                `${idea}\n\nBackground:\n${background}`,
                "Requirements"
            );

            // Save Requirements section
            const { data: requirementsRow } = await supabase
                .from("spec_sections")
                .select("id")
                .eq("project_id", projectId)
                .ilike("section_type", "Requirements")
                .maybeSingle();

            if (requirementsRow) {
                await supabase
                    .from("spec_sections")
                    .update({ content: requirements, updated_at: new Date() })
                    .eq("id", requirementsRow.id);
            }

            await supabase
                .from("agent_runs")
                .update({ status: "completed", output: { text: requirements } })
                .eq("project_id", projectId)
                .eq("section_type", "Requirements");

            // STEP 2.5 — Tech Stack (depends on Background & Requirements)
            await supabase.from("agent_runs").insert({
                project_id: projectId,
                section_type: "Tech Stack",
                agent_name: "TechStackAgent",
                status: "running",
                output: {},
            });

            const techStack = await runTechStackAgent(idea, background, requirements);

            const { data: techStackRow } = await supabase
                .from("spec_sections")
                .select("id")
                .eq("project_id", projectId)
                .ilike("section_type", "Tech Stack")
                .maybeSingle();

            if (techStackRow) {
                await supabase
                    .from("spec_sections")
                    .update({ content: techStack, updated_at: new Date() })
                    .eq("id", techStackRow.id);
            }

            await supabase
                .from("agent_runs")
                .update({ status: "completed", output: { text: "JSON configured" } })
                .eq("project_id", projectId)
                .eq("section_type", "Tech Stack");

            // STEP 3 — Remaining sections (run in parallel)
            const remainingSections = ["Method", "Implementation", "Milestones", "Evaluation"];

            // Insert "running" entries for all parallel sections upfront
            await supabase.from("agent_runs").insert(
                remainingSections.map((section) => ({
                    project_id: projectId,
                    section_type: section,
                    agent_name: `${section}Agent`,
                    status: "running",
                    output: {},
                }))
            );

            await Promise.all(
                remainingSections.map(async (section) => {
                    const output = await runSectionAgent(
                        `${idea}\n\nBackground:\n${background}\n\nRequirements:\n${requirements}`,
                        section
                    );

                    const { data: row } = await supabase
                        .from("spec_sections")
                        .select("id")
                        .eq("project_id", projectId)
                        .ilike("section_type", section)
                        .maybeSingle();

                    if (!row) return;

                    await supabase
                        .from("spec_sections")
                        .update({ content: output, updated_at: new Date() })
                        .eq("id", row.id);

                    // Mark agent run as completed
                    await supabase
                        .from("agent_runs")
                        .update({ status: "completed", output: { text: output } })
                        .eq("project_id", projectId)
                        .eq("section_type", section);
                })
            );

            return true;
        },
        regenerateSection: async (
            _: any,
            { projectId, sectionType }: any,
            context: any
        ) => {
            if (!context.user) throw new Error("Not authenticated");

            // Build context from Idea and existing sections
            const { data: project } = await supabase.from("projects").select("description").eq("id", projectId).single();
            const idea = project?.description ?? "";

            const { data: sections } = await supabase.from("spec_sections").select("*").eq("project_id", projectId);

            let llmContext = `Idea:\n${idea}\n\n`;
            if (sections) {
                for (const s of sections) {
                    if (s.section_type.toLowerCase() !== sectionType.toLowerCase() && s.content) {
                        llmContext += `[${s.section_type}]:\n${s.content}\n\n`;
                    }
                }
            }

            // Log running state and get inserted ID to avoid updating wrong runs
            const { data: runRow, error: runErr } = await supabase.from("agent_runs").insert({
                project_id: projectId,
                section_type: sectionType,
                agent_name: `${sectionType}Agent`,
                status: "running",
                output: {},
            }).select("id").single();

            if (runErr) console.error("Agent runs insert error:", runErr);

            // Run AI
            let output = "";
            if (sectionType.toLowerCase() === "tech stack") {
                let bg = "";
                let req = "";
                if (sections) {
                    bg = sections.find(s => s.section_type.toLowerCase() === "background")?.content ?? "";
                    req = sections.find(s => s.section_type.toLowerCase() === "requirements")?.content ?? "";
                }
                output = await runTechStackAgent(idea, bg, req);
            } else {
                output = await runSectionAgent(llmContext, sectionType);
            }

            // Update main spec section
            const { data: row } = await supabase
                .from("spec_sections")
                .select("id")
                .eq("project_id", projectId)
                .ilike("section_type", sectionType)
                .maybeSingle();

            if (row) {
                await supabase.from("spec_sections").update({ content: output, updated_at: new Date() }).eq("id", row.id);
            }

            // Mark exact run as completed
            if (runRow) {
                await supabase
                    .from("agent_runs")
                    .update({ status: "completed", output: { text: output } })
                    .eq("id", runRow.id);
            }

            return true;
        },
    },
    Query: {
        specSections: async (_: any, { projectId }: any) => {

            const { data, error } = await supabase
                .from("spec_sections")
                .select("*")
                .eq("project_id", projectId)
                .order("section_type", { ascending: true });

            if (error) throw error;

            return data;
        },
        projects: async (_: any, __: any, context: any) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("user_id", context.user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return data;
        },
        project: async (_: any, { id }: any, context: any) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("id", id)
                .eq("user_id", context.user.id)
                .single();

            if (error) throw error;

            return data;
        },
        agentRuns: async (
            _: any,
            { projectId }: any,
            context: any
        ) => {

            if (!context.user) {
                throw new Error("Not authenticated");
            }

            const { data, error } = await supabase
                .from("agent_runs")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: true });

            if (error) throw error;

            return data;
        },
    },
};