import { useRef } from "react";
// Mouse drag-to-scroll for the carousel tracks. Touch already swipes natively;
// desktop mice have no horizontal swipe, so without this the cards only move
// via the arrows / trackpad. A real drag (>5px) suppresses the click that
// follows it, so links/buttons inside cards don't fire after a drag.
export function useDragScroll(trackRef: React.RefObject<HTMLDivElement | null>) {
  const drag = useRef({ x: 0, sl: 0, down: false, moved: false });
  const movedRef = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current; if (!el) return;
    drag.current = { x: e.clientX, sl: el.scrollLeft, down: true, moved: false };
    movedRef.current = false;
    try { el.setPointerCapture(e.pointerId); } catch { /* older browsers: leave-drag ends it */ }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    const el = trackRef.current; if (!el) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 5 && !drag.current.moved) { drag.current.moved = true; movedRef.current = true; el.style.userSelect = "none"; el.style.cursor = "grabbing"; }
    if (drag.current.moved) el.scrollLeft = drag.current.sl - dx;
  };
  const end = () => { const el = trackRef.current; drag.current.down = false; if (el) { el.style.userSelect = ""; el.style.cursor = ""; } };
  const onClickCapture = (e: React.SyntheticEvent) => { if (movedRef.current) { e.preventDefault(); e.stopPropagation(); movedRef.current = false; } };
  const onDragStart = (e: React.SyntheticEvent) => e.preventDefault();
  return { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onClickCapture, onDragStart };
}
