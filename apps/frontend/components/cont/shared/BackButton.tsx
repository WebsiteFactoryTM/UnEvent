import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const BackButton = ({ href }: { href: string }) => {
  return (
    <Button variant="outline">
      <Link href={href}>Înapoi</Link>
    </Button>
  );
};

export default BackButton;
