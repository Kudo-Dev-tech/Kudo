import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ChevronDown, OctagonAlert } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { networks } from "@/lib/networks";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

export function NetworkWidget() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const wallet = wallets[0];
  const chainId = wallet?.chainId || "unknown";

  const currentNetwork = !authenticated
    ? networks.sonic
    : Object.values(networks).find(
        (network) => `eip155:${network.id}` === chainId,
      ) || { name: "Unsupported Network", iconUrl: undefined };

  const switchNetwork = async (networkChainId: number) => {
    if (!authenticated) return;
    try {
      await wallet.switchChain(networkChainId);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!isMobile) {
    return (
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild disabled={!authenticated}>
          <Button
            id="network-widget-trigger"
            variant="outline"
            className="bg-white px-2 xs:px-3"
          >
            {currentNetwork.iconUrl ? (
              <Avatar className="w-4 h-4 !rounded-none">
                <AvatarImage
                  src={currentNetwork.iconUrl}
                  alt={currentNetwork.name}
                />
                <AvatarFallback>
                  {currentNetwork.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <OctagonAlert className="size-4 text-stone-600" />
            )}
            <span className="text-l3 hidden xs:block">
              {currentNetwork.name}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "-rotate-180" : ""
              }`}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 text-l3" align="end">
          {Object.entries(networks).map(([key, network]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => switchNetwork(network.id)}
              disabled={!authenticated}
            >
              <Image
                src={network.iconUrl}
                alt={network.name}
                width={16}
                height={16}
              />
              {network.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          id="network-widget-trigger"
          variant="outline"
          className="bg-white px-2 xs:px-3"
          disabled={!authenticated}
        >
          {currentNetwork.iconUrl ? (
            <Avatar className="w-4 h-4">
              <AvatarImage
                src={currentNetwork.iconUrl}
                alt={currentNetwork.name}
              />
              <AvatarFallback>{currentNetwork.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
          ) : (
            <OctagonAlert className="size-4 text-stone-600" />
          )}
          <span className="text-l3 hidden xs:block">{currentNetwork.name}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "-rotate-180" : ""
            }`}
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="mb-2">Switch Network</DrawerTitle>
          {Object.entries(networks).map(([key, network]) => (
            <Button
              variant="ghost"
              className="w-full justify-start mt-2 px-2"
              key={key}
              onClick={() => switchNetwork(network.id)}
            >
              <Image
                src={network.iconUrl}
                alt={network.name}
                width={16}
                height={16}
              />
              {network.name}
            </Button>
          ))}
        </DrawerHeader>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
