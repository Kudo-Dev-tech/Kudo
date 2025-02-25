import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { shortenAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { LogOut } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";

export function AccountWidget() {
  const { user, logout } = usePrivy();
  const [isOpen, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  if (!isMobile) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white px-2 xs:px-3">
            <Avatar className="w-4 h-4">
              <AvatarImage
                src={`https://effigy.im/a/${user?.wallet?.address}.svg`}
                alt={user?.wallet?.address || ""}
              />
              <AvatarFallback>0x</AvatarFallback>
            </Avatar>
            <span className="hidden xs:block text-sm">
              {shortenAddress(user?.wallet?.address || "")}
            </span>
            <span className="text-sm xs:hidden">
              {shortenAddress(user?.wallet?.address || "", "extra-short")}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 text-l3"
          align="end"
          inert={!isOpen ? true : false}
        >
          <DropdownMenuItem onClick={logout}>
            <LogOut className="size-4 text-red-500" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="bg-white px-2 xs:px-3">
          <Avatar className="w-4 h-4">
            <AvatarImage
              src={`https://effigy.im/a/${user?.wallet?.address}.svg`}
              alt={user?.wallet?.address || ""}
            />
            <AvatarFallback>0x</AvatarFallback>
          </Avatar>
          <span className="hidden xs:block text-sm">
            {shortenAddress(user?.wallet?.address || "")}
          </span>
          <span className="text-sm xs:hidden">
            {shortenAddress(user?.wallet?.address || "", "extra-short")}
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent inert={!isOpen ? true : false}>
        <DrawerHeader>
          <DrawerTitle>Account Settings</DrawerTitle>
          <Button
            variant="ghost"
            className="w-full justify-start mt-4 px-2"
            onClick={logout}
          >
            <LogOut className="size-4 text-red-500" />
            Disconnect
          </Button>
        </DrawerHeader>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
