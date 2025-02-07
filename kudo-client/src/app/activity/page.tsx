"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortenAddress } from "@/lib/utils";

interface Transaction {
  requester: string;
  action: string;
  status: "Approved" | "Rejected";
}

// Sample data - in real app this would come from an API
const allTransactions: Transaction[] = [
  { requester: "0x742d...3479", action: "Mint", status: "Approved" },
  {
    requester: "0x742d...3479",
    action: "Submit Condition",
    status: "Rejected",
  },
  {
    requester: "0x742d...3479",
    action: "Submit Settlement",
    status: "Approved",
  },
  { requester: "0x742d...3479", action: "Mint", status: "Rejected" },
  {
    requester: "0x742d...3479",
    action: "Submit Settlement",
    status: "Rejected",
  },
  { requester: "0x742d...3479", action: "Mint", status: "Approved" },
  {
    requester: "0x742d...3479",
    action: "Submit Condition",
    status: "Approved",
  },
  // Additional transactions for pagination demo
  { requester: "0x742d...3479", action: "Mint", status: "Approved" },
  {
    requester: "0x742d...3479",
    action: "Submit Settlement",
    status: "Rejected",
  },
  {
    requester: "0x742d...3479",
    action: "Submit Condition",
    status: "Approved",
  },
  { requester: "0x742d...3479", action: "Mint", status: "Rejected" },
  {
    requester: "0x742d...3479",
    action: "Submit Settlement",
    status: "Approved",
  },
];

const ITEMS_PER_PAGE = 5;

export default function ActivityPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTransactions = allTransactions.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("ellipsis");
      }
    }
    return pages.filter((page, index, array) =>
      page === "ellipsis" ? array[index - 1] !== "ellipsis" : true,
    );
  };

  return (
    <div className="container container-centered">
      <div className="w-full flex items-center justify-between flex-wrap gap-4 gap-y-4 py-5 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={`https://effigy.im/a/0x742d000000000000000000000000000000003479.svg`}
              alt={"0x742d000000000000000000000000000000003479"}
            />
            <AvatarFallback>0x</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-l3 text-neutral-500">Mediator Agent</p>
            <h1 className="text-l1 font-semibold font-mono text-neutral-900">
              {shortenAddress("0x742d000000000000000000000000000000003479")}
            </h1>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          Active
        </Badge>
      </div>

      <div className="space-y-4">
        <Table className="">
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentTransactions.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono">
                  {transaction.requester}
                </TableCell>
                <TableCell>{transaction.action}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      transaction.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, i) => (
              <PaginationItem key={i}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page as number);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
