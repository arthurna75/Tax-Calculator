import { getCodes } from "@/lib/tax/codes";
import CodeTable from "@/components/admin/CodeTable";

export default async function AdminCodesPage() {
  const codes = await getCodes();
  return <CodeTable codes={codes} />;
}
