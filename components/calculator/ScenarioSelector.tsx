"use client";

import { useState, useEffect, useRef } from "react";
import { SCENARIOS } from "@/lib/tax/scenarios";
import type { SettlementInput } from "@/lib/tax/calculations";

interface Props {
  onSelect: (input: SettlementInput) => void;
}

export default function ScenarioSelector({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="scenario-selector" ref={ref}>
      <button
        className="scenario-btn"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        가상 시나리오 입력 {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="scenario-dropdown">
          {SCENARIOS.map((s) => (
            <button
              key={s.key}
              className="scenario-dropdown-item"
              onClick={() => { onSelect(s.input); setOpen(false); }}
              type="button"
            >
              <span className="scenario-dropdown-label">{s.label}</span>
              <span className="scenario-dropdown-desc">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
