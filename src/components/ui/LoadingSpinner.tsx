import Image from "next/image";

export function LoadingSpinner({ ...props }) {
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
