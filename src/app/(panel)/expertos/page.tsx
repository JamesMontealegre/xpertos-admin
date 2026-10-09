import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { ACTIVE_SERVICE_STATUSES, payoutMethodLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr, type Column } from "@/components/ui/table";

export const metadata: Metadata = { title: "Expertos" };

// Bajo 1440 px, ciudad y fecha de aprobación van dentro de la primera columna.
const COLUMNS: Column[] = [
  { label: "Experto" },
  { label: "Ciudad", className: "hidden w-[8rem] min-[1440px]:table-cell" },
  { label: "Categorías", className: "w-[13rem]" },
  { label: "Calificación", className: "w-[7.5rem]" },
  { label: "Disponible", className: "w-[6.5rem]" },
  { label: "Activos", className: "w-[6rem]" },
  { label: "Medio de pago", className: "w-[9rem]" },
  { label: "Aprobado", className: "hidden w-[7rem] min-[1440px]:table-cell" },
];

export default async function ExpertsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: experts, error }, { data: categories }, { data: activeServices }] = await Promise.all([
    supabase
      .from("expert_profiles")
      .select("user_id, category_ids, rating_avg, rating_count, is_available, approved_at, payout_method, profile:profiles!expert_profiles_user_id_fkey(full_name, city, email)")
      .order("approved_at", { ascending: false }),
    supabase.from("service_categories").select("id, name"),
    supabase.from("services").select("expert_id").in("status", ACTIVE_SERVICE_STATUSES).not("expert_id", "is", null),
  ]);

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const activeCount = (activeServices ?? []).reduce<Record<string, number>>((acc, s) => {
    if (s.expert_id) acc[s.expert_id] = (acc[s.expert_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Expertos" description="Expertos aprobados y su disponibilidad." />
      <Card>
        <Table fit stack="lg">
          <THead columns={COLUMNS} />
          <TBody>
            {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar los expertos: {error.message}</EmptyRow>}
            {!error && (experts ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>Aún no hay expertos aprobados.</EmptyRow>
            )}
            {(experts ?? []).map((e) => (
              <Tr key={e.user_id}>
                <Td className="break-words">
                  <Link href={`/expertos/${e.user_id}`} className="font-medium text-primary hover:underline">
                    {e.profile?.full_name || "Experto"}
                  </Link>
                  {e.profile?.email && <span className="block text-xs text-slate-500">{e.profile.email}</span>}
                  <span className="block text-xs text-slate-400 min-[1440px]:hidden">
                    {[e.profile?.city, `aprobado el ${formatDate(e.approved_at)}`].filter(Boolean).join(" · ")}
                  </span>
                </Td>
                <Td className="hidden min-[1440px]:table-cell">{e.profile?.city ?? "—"}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {e.category_ids.length === 0 && <span className="text-slate-400">—</span>}
                    {e.category_ids.map((id) => (
                      <Badge key={id}>{categoryName.get(id) ?? "Categoría"}</Badge>
                    ))}
                  </div>
                </Td>
                <Td className="whitespace-nowrap">
                  <span className="text-accent">★</span> {Number(e.rating_avg).toFixed(1)}{" "}
                  <span className="text-xs text-slate-500">({e.rating_count})</span>
                </Td>
                <Td>{e.is_available ? <Badge tone="green">Sí</Badge> : <Badge tone="slate">No</Badge>}</Td>
                <Td>{activeCount[e.user_id] ?? 0}</Td>
                <Td className="whitespace-nowrap">
                  {e.payout_method ? payoutMethodLabel(e.payout_method) : <span className="text-slate-400">Sin definir</span>}
                </Td>
                <Td className="hidden whitespace-nowrap text-slate-600 min-[1440px]:table-cell">{formatDate(e.approved_at)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
