export const PRICING_STATS = [
  { label: "Billing", value: "EUR", detail: "Secure checkout via Dodo" },
  { label: "Flexibility", value: "Monthly", detail: "Change or cancel when you need" },
  { label: "Core", value: "GEO score", detail: "Every plan includes analysis & fixes" },
] as const;

export const PRICING_FAQ_ITEMS = [
  {
    question: "What happens after I subscribe?",
    answer:
      "You return to Signalor with an active subscription. Project limits, prompt caps, and engine access match the plan you chose. If you subscribed during onboarding, you are sent back to finish or launch your first run.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes. Upgrade when you need more projects or prompts; downgrades follow your billing provider’s rules. Contact support if you need help aligning invoices with a team purchase order.",
  },
  {
    question: "Do all plans include the URL analyzer?",
    answer:
      "The free analyzer stays available for quick checks. Paid plans add saved workspaces, history, scheduled re-analysis, and the integrations that keep scores aligned with Shopify or WordPress.",
  },
  {
    question: "Is VAT or tax included in the listed price?",
    answer:
      "Listed amounts are in EUR (or an approximate local equivalent) before any applicable taxes. Your checkout screen shows the final EUR total from the payment provider.",
  },
] as const;
