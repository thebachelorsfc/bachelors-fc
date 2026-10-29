// Web Push (VAPID) public configuration. The public key is safe to ship in
// code — it is sent to every browser that subscribes. The matching PRIVATE
// key lives only in the VAPID_PRIVATE_KEY env var (Vercel) and is read
// server-side in lib/notify.ts; it must never be committed or sent to a client.
export const VAPID_PUBLIC_KEY = "BCh9gCA5WtDPYyYW0GClVp5P6OV_Gro7yWMHSQU-Mho2qYxP1dbrlLOjOH2-tyVwjw3C2_6qbekF70yTVqcwvdI";
export const VAPID_SUBJECT = "mailto:thebachelorsfc@gmail.com";
