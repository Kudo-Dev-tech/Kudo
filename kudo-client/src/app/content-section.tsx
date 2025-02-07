"use client";

import { NftCard } from "@/components/product/nft-card";
import { useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CovenantDetails } from "@/lib/types/cnft";

export function NFTContent({
  covenantNfts,
}: {
  covenantNfts: CovenantDetails[];
}) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const itemsPerPage = 9;

  const totalItems = covenantNfts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = covenantNfts.slice(startIndex, endIndex);

  return (
    <>
      <div
        id="nft-content"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 py-4 animate-fade-in-2"
      >
        {currentItems.map((c) => (
          <NftCard key={c.nftId} covenantDetails={c} />
        ))}
      </div>
      <div className="animate-fade-in-2">
        <div className="flex justify-center md:justify-between items-center py-2">
          <span className="text-l3 text-neutral-500 text-nowrap w-full hidden md:block">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} entries
          </span>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/?page=${Math.max(1, currentPage - 1)}`}
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    className="active:bg-white"
                    href={`/?page=${i + 1}`}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href={`/?page=${Math.min(totalPages, currentPage + 1)}`}
                  aria-disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="placeholder w-full hidden md:block" />
        </div>
      </div>
    </>
  );
}
