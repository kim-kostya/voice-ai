import Image from "next/image";
import type { RefAttributes } from "react";

export function LoadingSpinner({ ...props }: RefAttributes<HTMLImageElement>) {
  return (
    <Image
      width={512}
      height={512}
      src="/loading-spinner.svg"
      alt="Loading..."
      {...props}
    />
  );
}
