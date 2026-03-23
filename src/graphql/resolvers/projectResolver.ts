import { supabase } from "@/lib/supabase";

export const projectResolver = {
  Mutation: {
    async createProject(_: any, { title }: { title: string }, context: any) {
      const user = context.user;

      if (!user) {
        throw new Error("Not authenticated");
      }

      // create project
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // create spec sections automatically
      const sections = [
        "Background",
        "Requirements",
        "Method",
        "Implementation",
        "Milestones",
        "Evaluation",
      ];

      const sectionRows = sections.map((section) => ({
        project_id: project.id,
        section_type: section,
      }));

      await supabase.from("spec_sections").insert(sectionRows);

      return project;
    },
  },
};