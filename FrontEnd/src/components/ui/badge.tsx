import * as React from "react";
import { type BadgeVariantProps, badgeVariants } from "./badge-variants";

import { cn } from "@/lib/utils";

 

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, BadgeVariantProps {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
