"use client";

export default function PromptsSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full px-6 py-6">{children}</div>
  );
}
