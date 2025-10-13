import Image from "next/image";
import { cn } from "@/lib/utils";

export function Loadingspinner() {
  return (
    <Image
      src="/loading-spinner.svg"
      alt="Loading..."
      className={cn("w-16 h-16")}
    />
  );
}
