import React from "react";
import { Link } from "react-router-dom";
import { Sparkle } from "@phosphor-icons/react";
import { useApp } from "../../contexts/AppContext";

const PlanLimitBadge = ({ count = 0, limitKey = "max_budgets", label = "used" }) => {
  const { planLimits } = useApp();
  const isPremium = !!planLimits?.is_premium;
  const max = planLimits?.limits?.[limitKey];

  if (isPremium || max === null || max === undefined) {
    return (
      <span className="moorly-pill moorly-pill--good !text-[11.5px]" title="Pro Unlimited">
        <span>{count} active · Pro Unlimited</span>
      </span>
    );
  }

  const atLimit = count >= max;

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`moorly-pill font-mono !text-[11.5px] ${
          atLimit ? "moorly-pill--warn" : "moorly-pill--accent"
        }`}
      >
        {count} / {max} {label}
      </span>
      {atLimit && (
        <Link
          to="/upgrade"
          className="moorly-pill moorly-pill--plain !text-[11px] hover:opacity-90 transition-opacity"
          style={{
            background: "var(--warm-soft)",
            color: "var(--warm-text)",
            boxShadow: "inset 0 0 0 1px var(--line-2)",
          }}
        >
          <Sparkle size={12} weight="fill" />
          <span>Upgrade to Pro</span>
        </Link>
      )}
    </span>
  );
};

export default PlanLimitBadge;

