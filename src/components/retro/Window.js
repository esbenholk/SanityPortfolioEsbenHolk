import React from "react";

// Win9x-style window chrome around any content. `actions` renders before the controls.
export default function Window({
  title,
  children,
  className = "",
  bodyClassName = "",
  id,
  actions,
}) {
  return (
    <section className={`win ${className}`} id={id}>
      <header className="win__bar">
        <span className="win__title">{title}</span>
        {actions && <span className="win__actions">{actions}</span>}
        <span className="win__controls" aria-hidden="true">
          <span>_</span>
          <span>□</span>
          <span>×</span>
        </span>
      </header>
      <div className={`win__body ${bodyClassName}`}>{children}</div>
    </section>
  );
}
