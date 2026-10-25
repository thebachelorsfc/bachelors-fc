// Turn a pasted YouTube / Facebook video link into an embeddable player URL.
export function videoEmbed(url: string): { kind: "youtube" | "facebook" | "link"; embed: string } {
  const u = (url || "").trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return { kind: "youtube", embed: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  if (/facebook\.com|fb\.watch/.test(u))
    return { kind: "facebook", embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&t=0` };
  return { kind: "link", embed: u };
}
export const isVideoUrl = (url: string) => /youtube\.com|youtu\.be|facebook\.com|fb\.watch/.test(url || "");
// Facebook "share" links (facebook.com/share/...) open fine in a browser but the
// embed player refuses them — it needs the address the share link lands on.
export const isFbShareLink = (url: string) => /facebook\.com\/share\//.test(url || "");
