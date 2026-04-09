"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton className="!h-11 !rounded-full !bg-[linear-gradient(135deg,var(--solana-purple),var(--solana-green))] !px-5 !font-mono !text-sm !text-black" />
  );
}
