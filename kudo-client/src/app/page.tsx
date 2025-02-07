"use client";

import { Button } from "@/components/ui/button";
import { NFTContent } from "./content-section";
import { useCovenantNfts } from "@/hooks/use-covenant-nfts";
import Loading from "./loading";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Suspense } from "react";

const STATUS_OPTIONS = [
  { id: "minted", label: "Minted" },
  { id: "ongoing", label: "Ongoing" },
  { id: "completed", label: "Completed" },
];

const CATEGORY_OPTIONS = [
  { id: "Influence", label: "Influence" },
  { id: "Loan", label: "Loan" },
];

type Filters = {
  status: Set<string>;
  category: Set<string>;
  showOnlyMine: boolean;
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, authenticated } = usePrivy();

  const filters = {
    status: new Set(
      searchParams.get("status")?.split(",") || STATUS_OPTIONS.map((s) => s.id),
    ),
    category: new Set(
      searchParams.get("category")?.split(",") ||
        CATEGORY_OPTIONS.map((c) => c.id),
    ),
    showOnlyMine: searchParams.get("showOnlyMine") === "true",
  };

  const updateSearchParams = (
    updates: Partial<{
      status: Set<string>;
      category: Set<string>;
      showOnlyMine: boolean;
    }>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (updates.status !== undefined) {
      const statusArray = Array.from(updates.status);
      if (statusArray.length === STATUS_OPTIONS.length) {
        newSearchParams.delete("status");
      } else {
        newSearchParams.set("status", statusArray.join(","));
      }
    }

    if (updates.category !== undefined) {
      const categoryArray = Array.from(updates.category);
      if (categoryArray.length === CATEGORY_OPTIONS.length) {
        newSearchParams.delete("category");
      } else {
        newSearchParams.set("category", categoryArray.join(","));
      }
    }

    if (updates.showOnlyMine !== undefined) {
      if (updates.showOnlyMine) {
        newSearchParams.set("showOnlyMine", "true");
      } else {
        newSearchParams.delete("showOnlyMine");
      }
    }

    router.push(`?${newSearchParams.toString()}`);
  };

  const handleFilterChange = (type: keyof typeof filters, id: string) => {
    if (type === "showOnlyMine") return;

    const newSet = new Set(filters[type]);
    if (newSet.has(id)) {
      if (newSet.size > 1) {
        newSet.delete(id);
      }
    } else {
      newSet.add(id);
    }
    updateSearchParams({ [type]: newSet });
  };

  const handleShowOnlyMineChange = (checked: boolean) => {
    updateSearchParams({ showOnlyMine: checked });
  };

  const getFilterLabel = (
    type: keyof Filters,
    options: typeof STATUS_OPTIONS,
  ) => {
    if (type === "showOnlyMine") return "";
    const selectedCount = filters[type].size;
    if (selectedCount === options.length)
      return `All ${type[0].toUpperCase() + type.slice(1)}`;
    if (selectedCount === 0) return `No ${type}`;
    return `${type[0].toUpperCase() + type.slice(1)} (${selectedCount})`;
  };

  const contractAddress = process.env
    .NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);

  const isAuthenticated = (authenticated && ready) || false;

  const filterBelow = process.env.NEXT_PUBLIC_NFT_ID_FILTER_BELOW
    ? parseInt(process.env.NEXT_PUBLIC_NFT_ID_FILTER_BELOW)
    : undefined;

  const { covenantNfts, isFetched } = useCovenantNfts({
    contractAddress,
    chainId,
    filters,
    filterBelow,
  });

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center h-[50vh]">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-stone-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="text-l2 font-medium text-stone-900">No cNFTs found</h3>
      <p className="mt-1 text-l3 text-stone-500">
        There are currently no Covenant NFTs available to display.
      </p>
    </div>
  );

  return (
    <div className="container container-centered mb-8">
      <div className="w-full flex items-center justify-between flex-wrap gap-2 gap-y-4 py-5 border-b border-stone-200 animate-fade-in-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-l1 font-semibold text-neutral-900">
            Browse cNFTs
          </h1>
          <p className="text-l3 text-neutral-500">
            Each Covenant NFT (cNFT) represents a promise made by an AI agent
          </p>
        </div>
        {isFetched && (
          <div className="flex flex-wrap items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-l3 bg-white">
                  {getFilterLabel("status", STATUS_OPTIONS)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2">
                {STATUS_OPTIONS.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center space-x-2 p-2"
                  >
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={filters.status.has(status.id)}
                      onCheckedChange={() =>
                        handleFilterChange("status", status.id)
                      }
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-l3 bg-white">
                  {getFilterLabel("category", CATEGORY_OPTIONS)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 p-2"
                  >
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={filters.category.has(category.id)}
                      onCheckedChange={() =>
                        handleFilterChange("category", category.id)
                      }
                    />
                    <label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 rounded-md border border-input bg-white px-3 py-[9px]">
              <Checkbox
                id="show-only-my-cnfts"
                className="size-4"
                checked={filters.showOnlyMine}
                onCheckedChange={handleShowOnlyMineChange}
                disabled={!isAuthenticated}
              />
              <label
                htmlFor="show-only-my-cnfts"
                className={`text-sm font-medium leading-none cursor-pointer ${
                  !isAuthenticated ? "opacity-50" : ""
                }`}
              >
                Show only my cNFTs
              </label>
            </div>
          </div>
        )}
      </div>
      <Suspense fallback={<Loading />}>
        {isFetched ? (
          covenantNfts && covenantNfts.length > 0 ? (
            <NFTContent covenantNfts={covenantNfts} />
          ) : (
            <EmptyState />
          )
        ) : (
          <Loading />
        )}
      </Suspense>
    </div>
  );
}
