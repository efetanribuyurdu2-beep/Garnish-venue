/** The menu and, over it, a drink opened from it (the @modal slot). */
export default function VenueLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
