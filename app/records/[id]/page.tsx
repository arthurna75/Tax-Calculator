import { notFound } from "next/navigation";
import { getSettlement } from "@/lib/tax/settlements";
import ResultSteps from "@/components/calculator/ResultSteps";
import RecordDetailActions from "@/components/records/RecordDetailActions";

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getSettlement(id);
  if (!record) notFound();

  return (
    <div className="record-detail-page">
      <h1>{record.title}</h1>
      <p className="record-detail-year">{record.tax_year}년 · 저장일 {new Date(record.created_at).toLocaleDateString()}</p>
      <RecordDetailActions record={record} />
      <ResultSteps result={record.result} />
    </div>
  );
}
