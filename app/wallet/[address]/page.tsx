import { WalletPageClient } from "@/components/pages/WalletPageClient";

export default async function WalletPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return <WalletPageClient address={address} />;
}
