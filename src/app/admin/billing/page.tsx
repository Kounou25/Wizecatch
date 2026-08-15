import Link from "next/link";
import {
  listPayments,
  listLocalSubscriptions,
  listFailedEvents,
  summarize,
} from "@/lib/admin/billing";
import {
  PageTitle,
  Panel,
  KpiCard,
  Badge,
  AdminTable,
  Row,
  Cell,
} from "@/components/admin/admin-ui";
import {
  BarChartIcon,
  CheckIcon,
  XIcon,
  ActivityIcon,
  ExternalLinkIcon,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const FILTERS = ["all", "succeeded", "failed", "processing"];

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

function statusTone(status: string) {
  if (status === "succeeded") return "emerald" as const;
  if (status === "failed" || status === "cancelled") return "red" as const;
  return "amber" as const;
}

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "all" } = await searchParams;
  const current = FILTERS.includes(status) ? status : "all";

  const [{ payments, error }, subscriptions, failures] = await Promise.all([
    listPayments(current),
    listLocalSubscriptions(),
    listFailedEvents(),
  ]);

  const totals = summarize(payments);

  return (
    <>
      <PageTitle
        title="Billing"
        subtitle={`${payments.length} payments from Dodo · ${subscriptions.length} subscriptions recorded locally`}
      />

      {/* Une clé absente ou un mauvais mode se voit ici plutôt que de produire
          une page vide qu'on prendrait pour une absence de ventes. */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-medium">Dodo API unreachable</p>
          <p className="mt-0.5 text-xs">{error}</p>
        </div>
      )}

      {/* L'alerte qui compte : un paiement encaissé dont l'effet n'a pas été
          appliqué, c'est un client qui a payé sans recevoir son plan. */}
      {failures.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-900">
            {failures.length} webhook{failures.length > 1 ? "s" : ""} received but not applied
          </p>
          <ul className="mt-2 space-y-1">
            {failures.map((failure) => (
              <li key={failure.id} className="text-xs text-amber-800">
                <code className="rounded bg-amber-100 px-1">{failure.eventType}</code>{" "}
                {failure.error}
                <span className="ml-2 text-amber-600">
                  {new Date(failure.createdAt).toLocaleString("en-GB")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Collected"
          value={money(totals.grossRevenue, totals.currency)}
          icon={BarChartIcon}
          tone="emerald"
          hint="Refunded payments excluded"
        />
        <KpiCard label="Succeeded" value={totals.succeeded} icon={CheckIcon} />
        <KpiCard label="Failed" value={totals.failed} icon={XIcon} tone="amber" />
        <KpiCard
          label="Subscriptions"
          value={subscriptions.length}
          icon={ActivityIcon}
          tone="zinc"
          hint="As recorded in our database"
        />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900">Payments</h2>
          <div className="inline-flex items-center gap-0.5 rounded-lg bg-zinc-100 p-0.5">
            {FILTERS.map((filter) => (
              <Link
                key={filter}
                href={`/admin/billing?status=${filter}`}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 ${
                  filter === current
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {filter}
              </Link>
            ))}
          </div>
        </div>

        <AdminTable
          headers={["Date", "Customer", "Amount", "Status", "Method", "Invoice"]}
          isEmpty={payments.length === 0}
          empty={error ? "Could not reach Dodo." : "No payments yet."}
        >
          {payments.map((payment) => (
            <Row key={payment.id}>
              <Cell muted>{new Date(payment.createdAt).toLocaleString("en-GB")}</Cell>
              <Cell>
                <span className="block">{payment.customerEmail}</span>
                {payment.customerName && (
                  <span className="block text-xs text-zinc-400">{payment.customerName}</span>
                )}
              </Cell>
              <Cell>
                <span className="font-medium tabular-nums">
                  {money(payment.amount, payment.currency)}
                </span>
              </Cell>
              <Cell>
                <span className="flex flex-wrap items-center gap-1">
                  <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
                  {/* Remboursement et litige changent la lecture du montant :
                      ils doivent être visibles sur la même ligne. */}
                  {payment.refundStatus && <Badge tone="amber">refund</Badge>}
                  {payment.disputeStatus && <Badge tone="red">dispute</Badge>}
                </span>
              </Cell>
              <Cell muted>
                {payment.cardLast4
                  ? `${payment.cardBrand ?? "card"} ···· ${payment.cardLast4}`
                  : "—"}
              </Cell>
              <Cell>
                {payment.invoiceUrl ? (
                  <a
                    href={payment.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline"
                  >
                    Open
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-zinc-300">—</span>
                )}
              </Cell>
            </Row>
          ))}
        </AdminTable>
      </div>

      <div className="mt-8">
        <Panel
          title="Subscriptions"
          hint="What our database recorded — compare with the payments above to spot a missed webhook."
        >
          <AdminTable
            headers={["Customer", "Plan", "Status", "Renews", "Dodo ID"]}
            isEmpty={subscriptions.length === 0}
            empty="No subscription recorded yet."
          >
            {subscriptions.map((subscription) => (
              <Row key={subscription.providerSubscriptionId}>
                <Cell>{subscription.email}</Cell>
                <Cell>
                  <Badge tone="purple">{subscription.plan}</Badge>
                </Cell>
                <Cell>
                  <span className="flex flex-wrap items-center gap-1">
                    <Badge tone={subscription.status === "active" ? "emerald" : "amber"}>
                      {subscription.status}
                    </Badge>
                    {subscription.cancelAtPeriodEnd && <Badge tone="zinc">ending</Badge>}
                  </span>
                </Cell>
                <Cell muted>
                  {subscription.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB")
                    : "—"}
                </Cell>
                <Cell muted>
                  <code className="text-xs">
                    {subscription.providerSubscriptionId.slice(0, 18)}…
                  </code>
                </Cell>
              </Row>
            ))}
          </AdminTable>
        </Panel>
      </div>
    </>
  );
}
