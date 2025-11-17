import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

export default function SearchBar({ searchQuery, onSearchChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 relative flex items-center">
      {/* DESKTOP / TABLET VIEW */}
      <div className="hidden sm:block flex-1 relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-lg text-xs sm:text-sm"
        />
      </div>

      {/* MOBILE VIEW */}
      <div className="sm:hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-lg">
              <Search className="h-5 w-5" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={10} 
            className="w-[95vw] p-0 text-wrap"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 text-sm text-wrap"
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
