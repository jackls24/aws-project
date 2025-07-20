function DragDropUpload({ children, onDrop, onDragOver }) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
      onDrop={onDrop}
      onDragOver={onDragOver}
      style={{ position: "relative" }}
    >
      {children}
    </div>
  );
}

export default DragDropUpload;
