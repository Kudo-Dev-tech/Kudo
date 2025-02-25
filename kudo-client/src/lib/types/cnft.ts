export enum Status {
  Minted = "minted",
  Ongoing = "ongoing",
  Completed = "completed",
}

export enum Category {
  PactA = "pact A",
  PactB = "pact B",
  Loan = "loan",
}

export interface Asset {
  address: string;
  decimals: number;
  symbol: string;
}

export type SimplifiedCovenantContract = {
  agentWallet: string;
  agentId: string;
  status: number;
  nftType: number;
  goal: string;
  subgoalsId: bigint[];
  price: bigint;
  parentGoalId: bigint;
  settlementAsset: string;
  settlementAmount: bigint;
  minAbilityScore: bigint;
  abilityScore: bigint;
  shouldWatch: boolean;
  data: string;
};

export type CovenantDetailsContract = {
  nftId: bigint;
  nftType: number;
  agentWallet: string;
  agentId: string;
  agentName: string;
  status: number;
  goal: string;
  settlementAsset: string;
  owner: string;
  settlementAmount: bigint;
  price: bigint;
  abilityScore: bigint;
  subgoalsId: bigint[];
  parentGoalId: bigint;
  shouldWatch: boolean;
  settlementData: string;
  data: string;
};

export type CovenantDetails = {
  nftId: bigint;
  nftType: Category; // 0: Pact, 1: Loan
  agentWallet: string;
  agentId: string;
  agentName: string;
  status: Status; // Minted, Ongoing, Completed
  goal: string;
  ask: { label: string; href?: string };
  settlement: { label: string; href?: string };
  asset: Asset;
  owner: string;
  price: bigint;
  abilityScore: bigint;
  subgoalsId: bigint[];
  subgoalsAgents: string[];
  parentGoalId: bigint;
  parentGoalAgent: string;
  nftMarketplaceLink?: string;
};
