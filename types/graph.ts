export interface GraphNode {
  id: string;
  label: string;
  volume: number;
  transactionCount: number;
  color: string;
  feePayer?: string;
  isClustered?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  value: number;
  slot: number;
}

export interface GraphCluster {
  feePayer: string;
  walletCount: number;
  wallets: string[];
}

export interface GraphData {
  tokenAddress: string;
  nodes: GraphNode[];
  links: GraphLink[];
  clusters: GraphCluster[];
  generatedAt: number;
}
