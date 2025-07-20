export default function EmptyState({ searchTerm }) {
  return (
    <div className="text-center py-12">
      <div className="text-slate-400 text-lg animate-fade-in">
        {searchTerm
          ? "Nessuna immagine trovata per la ricerca"
          : "Nessuna immagine disponibile"}
      </div>
    </div>
  );
}