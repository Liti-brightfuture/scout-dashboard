import Link from "next/link";

import { Panel } from "@/components/ui/Panel";

export default function NotFound() {
  return (
    <Panel>
      <h1 className="font-mono text-3xl text-white">Signal lost</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        The requested Scout page could not be found.
      </p>
      <Link href="/" className="mt-6 inline-flex rounded-full bg-[var(--solana-purple)] px-4 py-2 text-sm text-white">
        Return home
      </Link>
    </Panel>
  );
}
