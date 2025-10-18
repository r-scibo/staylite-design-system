import { Separator } from "@/components/ui/separator";

interface PricingData {
  nights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

interface PriceBreakdownProps {
  pricing: PricingData;
}

export function PriceBreakdown({ pricing }: PriceBreakdownProps) {
  const nightlyAvg = pricing.subtotal / pricing.nights;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground">Price Breakdown</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-foreground">
          <span>
            €{nightlyAvg.toFixed(2)} × {pricing.nights} {pricing.nights === 1 ? "night" : "nights"}
          </span>
          <span>€{pricing.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-foreground">
          <span>Cleaning fee</span>
          <span>€{pricing.cleaningFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-foreground">
          <span>Service fee (12%)</span>
          <span>€{pricing.serviceFee.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-foreground">
          <span>Taxes (10%)</span>
          <span>€{pricing.taxes.toFixed(2)}</span>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex justify-between text-base font-bold text-foreground">
        <span>Total</span>
        <span>€{pricing.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
