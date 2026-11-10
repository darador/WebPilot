export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-[#070b12] to-[#070b12] p-4">
      {children}
    </div>
  );
}
