import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";

export const metadata: Metadata = { title: "Expertos" };

const COLUMNS = ["Nombre", "Ciudad", "Categorías", "Calificación", "Disponible", "Servicios activos", "Aprobado"];

export default async function ExpertsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: experts, error }, { data: categories }, { data: activeServices }] = await Promise.all([
    supabase
      .from("expert_profiles")
      .select("user_id, category_ids, rating_avg, rating_count, is_available, approved_at, profile:profiles!expert_profiles_user_id_fkey(full_name, city, email)")
      .order("approved_at", { ascending: false }),
    supabase.from("service_categories").select("id, name"),
    supabase.from("services").select("expert_id").in("status", ["assigned", "in_progress"]).not("expert_id", "is", null),
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
        <Table>
          <THead columns={COLUMNS} />
          <TBody>
            {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar los expertos: {error.message}</EmptyRow>}
            {!error && (experts ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>Aún no hay expertos aprobados.</EmptyRow>
            )}
            {(experts ?? []).map((e) => (
              <Tr key={e.user_id}>
                <Td>
                  <Link href={`/expertos/${e.user_id}`} className="font-medium text-primary hover:underline">
                    {e.profile?.full_name || "Experto"}
                  </Link>
                  {e.profile?.email && <span className="block text-xs text-slate-500">{e.profile.email}</span>}
                </Td>
                <Td>{e.profile?.city ?? "—"}</Td>
                <Td>
                  <div className="flex max-w-xs flex-wrap gap-1">
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
                <Td className="whitespace-nowrap text-slate-600">
                  {formatDate(e.approved_at)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
