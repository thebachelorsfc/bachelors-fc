import { permanentRedirect } from "next/navigation";
// The Privacy Policy lives on the Rules & Policy page (owner's call, 2026-11-03).
// This route stays as a permanent redirect so links already shared (e.g. the
// Facebook Page privacy-policy field) keep working.
export default function Privacy() {
  permanentRedirect("/rules");
}
