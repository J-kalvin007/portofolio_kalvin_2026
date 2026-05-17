/* Root layout — minimal wrapper, just provides html/body tags.
   The real layout with providers lives in app/[locale]/layout.tsx */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}