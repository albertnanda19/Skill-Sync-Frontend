"use client";

import * as React from "react";

export function useDelayedLoading(active: boolean, delayMs = 300) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShow(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [active, delayMs]);

  return show;
}
