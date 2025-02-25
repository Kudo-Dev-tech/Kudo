import { NftCardSkeleton } from "@/components/product/nft-card-skeleton";

export default function Loading() {
  return (
    <div
      id="nft-content"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 py-4 max-w-[1200px] mx-auto"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <NftCardSkeleton key={i} />
      ))}
    </div>
  );
}
