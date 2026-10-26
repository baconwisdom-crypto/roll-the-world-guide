"use client";

import { useState } from "react";
import { AdSlot } from "@/components/ad-slot";

export function DismissibleTopAd() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const dismiss = () => {
    document.body.classList.remove("has-top-ad");
    setVisible(false);
  };

  return <div className="site-top-ad">
    <div className="site-top-ad__inner">
      <AdSlot placement="top-sticky" format="top-sticky" />
      <button className="site-top-ad__close" type="button" aria-label="Close top advertisement" onClick={dismiss}>×</button>
    </div>
  </div>;
}
