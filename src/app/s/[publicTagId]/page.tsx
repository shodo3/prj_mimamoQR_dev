import { ScanClient } from "./ScanClient";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ publicTagId: string }>;
}) {
  const { publicTagId } = await params;
  return <ScanClient publicTagId={publicTagId} />;
}