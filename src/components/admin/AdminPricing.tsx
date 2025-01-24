import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AdminPricing = () => {
  const [costPerMinute, setCostPerMinute] = useState(0.05);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLatestPrice();
  }, []);

  const fetchLatestPrice = async () => {
    try {
      console.log("Fetching global price...");
      const { data, error } = await supabase
        .from('client_pricing')
        .select('cost_per_minute')
        .eq('client_name', 'default')
        .eq('company_name', 'default')
        .eq('email', 'default@example.com')
        .single();

      if (error) {
        console.error('Error fetching global price:', error);
        toast.error("Failed to fetch current price");
        return;
      }

      if (data) {
        console.log("Global price found:", data.cost_per_minute);
        setCostPerMinute(Number(data.cost_per_minute));
      }
    } catch (error) {
      console.error('Error in fetchLatestPrice:', error);
      toast.error("Failed to fetch current price");
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log("Starting save operation for new global price:", costPerMinute);
      
      const { error } = await supabase
        .from('client_pricing')
        .update({ cost_per_minute: costPerMinute })
        .eq('client_name', 'default')
        .eq('company_name', 'default')
        .eq('email', 'default@example.com');

      if (error) {
        console.error('Error saving global price:', error);
        toast.error("Failed to save new price");
        throw error;
      }
      
      console.log("Global price saved successfully");
      toast.success("Price updated successfully");
      await fetchLatestPrice(); // Refresh the price after saving
    } catch (error) {
      console.error('Error in save operation:', error);
      toast.error("Failed to save new price");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Global Voice AI Pricing</h2>
        <p className="text-gray-600 mb-4">
          Set the base cost per minute for Essential Voice AI services. Premium services will be charged at 2x this rate.
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <Label htmlFor="costPerMinute">Essential Cost per Minute ($)</Label>
          <Input
            id="costPerMinute"
            type="number"
            step="0.01"
            min="0"
            value={costPerMinute}
            onChange={(e) => {
              console.log("Price input changed to:", e.target.value);
              setCostPerMinute(Number(e.target.value));
            }}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-2">
            Premium Cost per Minute: ${(costPerMinute * 2).toFixed(2)}
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Global Price"}
        </Button>
      </div>
    </div>
  );
};