import Image from "next/image";
import { cn } from "@/lib/utils";

export function LoadingSpinner() {
  return (
    <Image
      width={512}
      height={512}
      src="/loading-spinner.svg"
      alt="Loading..."
      className={cn("w-16 h-16")}
    />
  );
}
