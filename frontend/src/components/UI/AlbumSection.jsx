import Album from "./album";

export default function AlbumSection({
  albumByTag,
  album,
  openedAlbumTag,
  onImageClick,
  onToggleAlbum,
  onDeleteAlbum,
  onCreateAlbum,
}) {
  return (
    <section className="mb-10 bg-grey-50 p-8 border-2 border-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Album</h2>
        <button
          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition"
          onClick={onCreateAlbum}
        >
          + Nuovo Album
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(albumByTag)
          .filter(([tag, imgs]) => imgs.length >= 2)
          .map(([tag, imgs]) => (
            <Album
              key={tag}
              tag={tag}
              images={imgs}
              onImageClick={onImageClick}
              open={openedAlbumTag === tag}
              onToggle={onToggleAlbum}
              onDeleteAlbum={onDeleteAlbum}
            />
          ))}
        
        {album.map((albumItem) => (
          <Album
            key={albumItem.albumName}
            tag={albumItem.albumName}
            images={albumItem.images}
            onImageClick={onImageClick}
            open={openedAlbumTag === albumItem.albumName}
            onToggle={onToggleAlbum}
            onDeleteAlbum={onDeleteAlbum}
          />
        ))}
      </div>
    </section>
  );
}