// A small (i) icon that reveals a styled popover on hover/focus.
// `align` picks which edge the popover anchors to so it stays on-screen.
export default function InfoHint({ children, align = 'left' }){
  return (
    <span className="info-hint-wrap">
      <span
        className="zoom-hint"
        tabIndex={0}
        role="button"
        aria-label="Panel help"
      >
        i
      </span>
      <span className={`hint-pop hint-pop-${align}`} role="tooltip">
        {children}
      </span>
    </span>
  );
}
