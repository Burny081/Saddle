import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Tag, Gift } from 'lucide-react';
import PromoCodesView from './PromoCodesView';
import LoyaltyProgramView from './LoyaltyProgramView';

export default function PromotionsView() {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="promo-codes" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="promo-codes" className="gap-2">
            <Tag className="h-4 w-4" />
            Codes Promo
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="gap-2">
            <Gift className="h-4 w-4" />
            Fidélité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="promo-codes">
          <PromoCodesView />
        </TabsContent>

        <TabsContent value="loyalty">
          <LoyaltyProgramView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
