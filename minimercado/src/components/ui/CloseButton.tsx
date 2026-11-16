'use client';
import { CloseButton as HeroCloseButton } from "@heroui/react";

interface BotaoFecharProps {
  onClick?: () => void;
}

export default function BotaoFecharCustomizado({ onClick }: BotaoFecharProps) {
  return (
    <HeroCloseButton
      aria-label="Fechar"
      onClick={onClick}
      className="size-8 rounded-full bg-[#374151] text-[#E5E7EB] hover:bg-[#1F2937] hover:text-white active:scale-95 transition-all"
    />
  );
}