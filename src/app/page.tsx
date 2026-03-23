import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    /* bg-surface-low: The 'Recess' layer.
       Using a flex-col so we can add a 'Label' above the login for that Pro-tool look.
    */
    <main className="flex h-screen flex-col items-center justify-center bg-surface-low p-6">
      
      {/* Technical label using the Mono font we defined */}
      <div className="mb-8 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/60">
          Secure Access Protocol
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Intelligent Workspace
        </h1>
      </div>

      {/* Wrap the button in a 'Glass' container to make it pop 
          against the recessed background.
      */}
      <div className="glass-panel p-8 rounded-md w-full max-w-sm flex flex-col items-center">
        <p className="text-sm text-content/50 mb-6 text-center">
          Authenticate to enter the monolith.
        </p>
        
        <LoginButton />
      </div>
      
    </main>
  );
}