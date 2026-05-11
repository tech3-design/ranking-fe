"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  CreditCard,
  Trash2,
} from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  confirmBacklinkOrderPayment,
  deleteBacklinkOrder,
  getBacklinkCatalog,
  listBacklinkOrders,
  placeBacklinkOrder,
  type BacklinkLinkType,
  type BacklinkOrder,
  type BacklinkOrderStatus,
  type BacklinkProduct,
} from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINK_TYPE_LABEL: Record<BacklinkLinkType, string> = {
  guest_post: "Guest post",
  niche_edit: "Niche edit",
  sponsored: "Sponsored",
  citation: "Citation",
  other: "Other",
};

const STATUS_STYLES: Record<BacklinkOrderStatus, { label: string; cls: string }> = {
  draft:           { label: "Draft",       cls: "bg-muted/40 text-muted-foreground border-border" },
  pending_payment: { label: "Pay pending", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300" },
  queued:          { label: "Queued",      cls: "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300" },
  in_progress:     { label: "In progress", cls: "bg-orange-500/15 text-orange-800 border-orange-500/40 dark:text-orange-300" },
  delivered:       { label: "Delivered",   cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300" },
  rejected:        { label: "Rejected",    cls: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300" },
  refunded:        { label: "Refunded",    cls: "bg-muted/40 text-muted-foreground border-border" },
  cancelled:       { label: "Cancelled",   cls: "bg-muted/40 text-muted-foreground border-border" },
};

function formatPrice(cents: number, currency: string) {
  const n = (cents || 0) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface Props {
  slug: string;
}

export function SiteBacklinkMarketplacePanel({ slug }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const [products, setProducts] = useState<BacklinkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterLinkType, setFilterLinkType] = useState<BacklinkLinkType | "all">("all");
  const [minDa, setMinDa] = useState<number>(0);

  const [orders, setOrders] = useState<BacklinkOrder[]>([]);

  const [buyingProduct, setBuyingProduct] = useState<BacklinkProduct | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<number | null>(null);
  const [payError, setPayError] = useState<{ id: number; msg: string } | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  async function removeOrder(order: BacklinkOrder) {
    if (order.status === "delivered") return; // BE refuses delivered too
    const confirmed = window.confirm(
      order.status === "queued" || order.status === "in_progress"
        ? `Cancel this order on ${order.domain}? It will be marked cancelled.`
        : `Delete this order on ${order.domain}?`,
    );
    if (!confirmed) return;
    setDeletingOrderId(order.id);
    try {
      await deleteBacklinkOrder(slug, order.id);
      // BE returns the cancelled order for queued/in_progress and {deleted}
      // for the rest. Either way we just drop it from the list — the user's
      // intent is "I'm done with this row". Status stays viewable on a refresh
      // if they want to see cancelled history.
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't delete order.";
      setPayError({ id: order.id, msg });
    } finally {
      setDeletingOrderId(null);
    }
  }

  async function payForOrder(order: BacklinkOrder) {
    setPayingOrderId(order.id);
    setPayError(null);
    try {
      const updated = await confirmBacklinkOrderPayment(slug, order.id);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (e) {
      setPayError({
        id: order.id,
        msg: e instanceof Error ? e.message : "Couldn't confirm payment.",
      });
    } finally {
      setPayingOrderId(null);
    }
  }

  const unpaidOrders = useMemo(
    () => orders.filter((o) => o.status === "pending_payment"),
    [orders],
  );

  const unpaidTotalCents = useMemo(
    () => unpaidOrders.reduce((s, o) => s + (o.price_cents || 0), 0),
    [unpaidOrders],
  );

  const refreshOrders = useCallback(async () => {
    if (!slug) return;
    try {
      const r = await listBacklinkOrders(slug, userEmail || undefined);
      setOrders(r.orders);
    } catch {
      // Non-fatal — keep prior orders on screen.
    }
  }, [slug, userEmail]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getBacklinkCatalog(slug),
      listBacklinkOrders(slug, userEmail || undefined).catch(() => ({ orders: [] })),
    ])
      .then(([catalog, ordersResp]) => {
        if (cancelled) return;
        setProducts(catalog.products);
        setOrders(ordersResp.orders);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Couldn't load catalog.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, userEmail]);

  const visibleProducts = useMemo(() => {
    let list = [...products];
    if (filterLinkType !== "all") list = list.filter((p) => p.link_type === filterLinkType);
    if (minDa > 0) list = list.filter((p) => (p.domain_authority ?? 0) >= minDa);
    return list;
  }, [products, filterLinkType, minDa]);

  function openBuy(product: BacklinkProduct) {
    setBuyingProduct(product);
    setOrderError(null);
  }

  async function submitOrder() {
    if (!buyingProduct) return;
    if (!userEmail) {
      setOrderError("Sign in to place an order.");
      return;
    }
    if (!targetUrl.trim() || !anchorText.trim()) {
      setOrderError("Target URL and anchor text are required.");
      return;
    }
    setPlacing(true);
    setOrderError(null);
    try {
      const order = await placeBacklinkOrder(slug, {
        product_id: buyingProduct.id,
        target_url: targetUrl.trim(),
        anchor_text: anchorText.trim(),
        user_email: userEmail,
      });
      setOrders((prev) => [order, ...prev]);
      setBuyingProduct(null);
    } catch (e) {
      setOrderError(e instanceof Error ? e.message : "Couldn't place order.");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading backlink marketplace…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-[12px] text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="size-4 text-orange-600 dark:text-orange-400" />
          <p className="text-sm font-semibold text-foreground">
            Buy backlinks
          </p>
          <span className="text-[11px] text-muted-foreground">
            {visibleProducts.length} listings
          </span>
        </div>
        {orders.length > 0 ? (
          <span className="text-[11px] text-muted-foreground">
            {orders.length} order{orders.length === 1 ? "" : "s"} placed
          </span>
        ) : null}
      </div>

      {unpaidOrders.length > 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-200">
              {unpaidOrders.length} order{unpaidOrders.length === 1 ? "" : "s"} waiting for payment
              · {formatPrice(unpaidTotalCents, unpaidOrders[0]?.currency || "USD")}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-amber-700 dark:text-amber-300/90">
              Your order isn&apos;t sent to the provider until you click <strong>Pay</strong> on each row below.
            </p>
          </div>
        </div>
      ) : null}

      {/* Existing orders */}
      {orders.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {orders.map((o) => {
            const s = STATUS_STYLES[o.status];
            const needsPayment = o.status === "pending_payment";
            const isPaying = payingOrderId === o.id;
            const rowError = payError && payError.id === o.id ? payError.msg : null;
            return (
              <div
                key={o.id}
                className="rounded-md border border-border bg-muted/15"
              >
                <div className="flex min-w-0 items-center gap-2 px-2.5 py-1.5">
                  {o.status === "delivered" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="size-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {o.title || o.domain}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {o.target_url} · &ldquo;{o.anchor_text}&rdquo;
                    </p>
                  </div>
                  <span className={`rounded border px-1.5 py-px text-[9px] font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                  {needsPayment ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        payForOrder(o);
                      }}
                      disabled={isPaying}
                      className="inline-flex items-center gap-1 rounded-md bg-orange-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
                    >
                      {isPaying ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <CreditCard className="size-3" />
                      )}
                      {isPaying
                        ? "Confirming…"
                        : `Pay ${formatPrice(o.price_cents, o.currency)}`}
                    </button>
                  ) : null}
                  {o.proof_url ? (
                    <a
                      href={o.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                  {o.status !== "delivered" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOrder(o);
                      }}
                      disabled={deletingOrderId === o.id}
                      className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label="Delete order"
                      title="Delete order"
                    >
                      {deletingOrderId === o.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </button>
                  ) : null}
                </div>
                {rowError ? (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-2.5 py-1 text-[10px] text-destructive">
                    {rowError}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {(["all", "guest_post", "niche_edit", "sponsored", "citation"] as const).map((k) => {
          const active = filterLinkType === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilterLinkType(k)}
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                active
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {k === "all" ? "All" : LINK_TYPE_LABEL[k as BacklinkLinkType]}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Min DA</span>
          <input
            type="number"
            min={0}
            max={100}
            value={minDa}
            onChange={(e) => setMinDa(Number(e.target.value) || 0)}
            className="h-6 w-14 rounded border border-border bg-card px-1.5 text-[11px] text-foreground"
          />
        </div>
      </div>

      {/* Catalog grid — premium cards (high DA) get a peach gradient. */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleProducts.length === 0 ? (
          <div className="col-span-full rounded-md border border-dashed border-border/70 bg-muted/15 px-3 py-8 text-center">
            <p className="text-[12px] font-medium text-foreground">No listings match these filters</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Try removing the DA cutoff or switching link type.
            </p>
          </div>
        ) : (
          visibleProducts.map((p) => {
            // Treat anything priced above $300 as premium. Price is in
            // cents on the BE, so the threshold is 30_000.
            const isPremium = (p.price_cents ?? 0) > 30_000;
            const initial = (p.domain || "?").trim().charAt(0).toUpperCase();
            return (
              <div
                key={p.id}
                className={cn(
                  "flex min-w-0 flex-col gap-3 rounded-2xl p-4 transition shadow-sm hover:shadow-md",
                  isPremium
                    ? "bg-gradient-to-br from-orange-200/80 via-orange-100 to-amber-50 dark:from-orange-500/25 dark:via-orange-500/10 dark:to-amber-500/10"
                    : "bg-card border border-border/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold",
                      isPremium
                        ? "bg-white/90 text-orange-700 dark:bg-orange-500/90 dark:text-white"
                        : "bg-muted text-foreground",
                    )}
                    aria-hidden
                  >
                    {initial}
                  </span>
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Premium
                    </span>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[11px] text-muted-foreground">
                    {p.provider_name}
                    <span className="text-muted-foreground/70"> · {p.lead_time_days}d</span>
                  </p>
                  <p
                    className="truncate text-[15px] font-semibold leading-tight text-foreground"
                    title={p.domain}
                  >
                    {p.domain}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                    {LINK_TYPE_LABEL[p.link_type]}
                  </span>
                  {p.domain_authority != null ? (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      DA {p.domain_authority}
                    </span>
                  ) : null}
                  {p.do_follow ? (
                    <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                      do-follow
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                  <p
                    className={cn(
                      "truncate text-[16px] font-bold tabular-nums",
                      isPremium ? "text-orange-700 dark:text-orange-300" : "text-foreground",
                    )}
                  >
                    {formatPrice(p.price_cents, p.currency)}
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openBuy(p);
                    }}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition",
                      isPremium
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-foreground text-background hover:bg-foreground/85",
                    )}
                  >
                    Buy now
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order modal — visual language matches the catalog cards: rounded-2xl,
          soft shadow, pill action buttons, peach-orange highlights for premium. */}
      {buyingProduct ? (() => {
        const isPremiumModal = (buyingProduct.price_cents ?? 0) > 30_000;
        const initial = (buyingProduct.domain || "?").trim().charAt(0).toUpperCase();
        return (
          <div
            className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => !placing && setBuyingProduct(null)}
            role="presentation"
          >
            <div
              className={cn(
                "relative flex w-full max-w-md flex-col gap-4 rounded-2xl p-5 shadow-2xl",
                isPremiumModal
                  ? "bg-gradient-to-br from-orange-200/80 via-orange-100 to-amber-50 dark:from-orange-500/25 dark:via-orange-500/10 dark:to-amber-500/10"
                  : "bg-card border border-border/70",
              )}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button
                type="button"
                disabled={placing}
                onClick={() => setBuyingProduct(null)}
                className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>

              {/* Header — matches the card top: avatar + premium pill */}
              <div className="flex items-start justify-between gap-2 pr-8">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold",
                    isPremiumModal
                      ? "bg-white/90 text-orange-700 dark:bg-orange-500/90 dark:text-white"
                      : "bg-muted text-foreground",
                  )}
                  aria-hidden
                >
                  {initial}
                </span>
                {isPremiumModal ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Premium
                  </span>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col gap-0.5">
                <p className="text-[11px] text-muted-foreground">
                  {buyingProduct.provider_name}
                  <span className="text-muted-foreground/70"> · {buyingProduct.lead_time_days}d delivery</span>
                </p>
                <p className="truncate text-base font-semibold leading-tight text-foreground">
                  {buyingProduct.domain}
                </p>
                <p
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    isPremiumModal ? "text-orange-700 dark:text-orange-300" : "text-foreground",
                  )}
                >
                  {formatPrice(buyingProduct.price_cents, buyingProduct.currency)}
                  <span className="ml-1 text-[11px] font-medium text-muted-foreground">
                    · {LINK_TYPE_LABEL[buyingProduct.link_type]}
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="bl-target-url" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Target URL on your site
                  </Label>
                  <Input
                    id="bl-target-url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://yourbrand.com/page"
                    disabled={placing}
                    className="rounded-lg bg-background/70"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bl-anchor" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Anchor text
                  </Label>
                  <Input
                    id="bl-anchor"
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    placeholder="The clickable text linking back to you"
                    disabled={placing}
                    className="rounded-lg bg-background/70"
                  />
                </div>
              </div>

              {orderError ? (
                <p className="text-[11px] text-destructive">{orderError}</p>
              ) : null}

              <p className="text-[10px] leading-snug text-muted-foreground">
                You&apos;ll be charged {formatPrice(buyingProduct.price_cents, buyingProduct.currency)} once
                payment is wired up. The provider handles the placement and shares the live URL when it&apos;s done.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={placing}
                  onClick={() => setBuyingProduct(null)}
                  className="rounded-full px-4 py-2 text-[12px] font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={placing}
                  onClick={submitOrder}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition disabled:opacity-60",
                    isPremiumModal
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-foreground text-background hover:bg-foreground/85",
                  )}
                >
                  {placing ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {placing ? "Placing…" : `Order ${formatPrice(buyingProduct.price_cents, buyingProduct.currency)}`}
                </button>
              </div>
            </div>
          </div>
        );
      })() : null}

      {orders.length > 0 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            refreshOrders();
          }}
          className="mt-2 text-[10px] text-muted-foreground hover:text-foreground hover:underline"
        >
          Refresh order status
        </button>
      ) : null}
    </div>
  );
}
