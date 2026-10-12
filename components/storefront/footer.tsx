import type { Navigate } from "@/lib/types";

export function Footer({ navigate }: { navigate: Navigate }) {
  return (
    <footer className="mt-16 border-t border-border px-5 py-10 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row">
        <span className="text-xl font-black tracking-[-0.08em]">NÓRD</span>
        <p className="text-xs text-muted-foreground">
          © 2026 NÓRD. Feito para ir além.
        </p>
        <div className="flex gap-5 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => navigate("perfil")}>Conta</button>
          <button onClick={() => navigate("catalogo")}>Loja</button>
        </div>
      </div>
    </footer>
  );
}
