import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CompanyInformation } from "./report/CompanyInformation";
import { CostAnalysis } from "./report/CostAnalysis";
import { AdditionalBenefits } from "./report/AdditionalBenefits";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from "./report/ReportPDF";

interface DetailedReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    name: string;
    companyName: string;
    phone: string;
    email: string;
    minutes: number;
  };
  costPerMinute: number;
}

export const DetailedReportDialog = ({
  open,
  onOpenChange,
  formData,
  costPerMinute,
}: DetailedReportDialogProps) => {
  // Calculate calls per hour for human operators (12.5 average)
  const humanCallsPerHour = 12.5;
  const humanCallsPerDay = humanCallsPerHour * 8;
  const humanCallsPerMonth = humanCallsPerDay * 22; // Assuming 22 working days
  
  // AI can handle multiple calls simultaneously (let's say 50)
  const aiSimultaneousCalls = 50;
  const aiCallsPerHour = aiSimultaneousCalls * 60; // Potential calls per hour
  const aiCallsPerDay = aiCallsPerHour * 24; // 24/7 operation
  const aiCallsPerMonth = aiCallsPerDay * 30; // Full month operation
  
  // Standard tier calculations with dynamic pricing
  const standardAICost = formData.minutes * costPerMinute;
  
  // Premium tier calculations (2x the base cost)
  const premiumCostPerMinute = costPerMinute * 2;
  const premiumAICost = formData.minutes * premiumCostPerMinute;
  
  // Calculate human operator cost based on $16/hour
  const humanOperatorCost = (formData.minutes / 60) * 16;
  
  // Calculate savings for both tiers
  const standardSavings = humanOperatorCost - standardAICost;
  const premiumSavings = humanOperatorCost - premiumAICost;
  
  const standardSavingsPercentage = ((standardSavings / humanOperatorCost) * 100).toFixed(1);
  const premiumSavingsPercentage = ((premiumSavings / humanOperatorCost) * 100).toFixed(1);
  const currentDate = new Date().toLocaleDateString();
  
  const reportData = {
    formData,
    calculations: {
      standardAICost,
      premiumAICost,
      humanOperatorCost,
      standardSavings,
      premiumSavings,
      standardSavingsPercentage,
      premiumSavingsPercentage,
      callMetrics: {
        humanCallsPerMonth,
        aiCallsPerMonth,
        aiSimultaneousCalls
      }
    },
    date: currentDate,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:w-[90%] max-w-[600px] h-[90vh] overflow-y-auto bg-gradient-to-br from-brand-light/10 to-white p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-brand">
            Detailed Cost Analysis Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-brand">{currentDate}</p>
          
          <div className="grid gap-6">
            <CompanyInformation formData={formData} />

            <CostAnalysis
              minutes={formData.minutes}
              standardAICost={standardAICost}
              premiumAICost={premiumAICost}
              humanOperatorCost={humanOperatorCost}
              standardSavings={standardSavings}
              premiumSavings={premiumSavings}
              standardSavingsPercentage={standardSavingsPercentage}
              premiumSavingsPercentage={premiumSavingsPercentage}
            />

            <AdditionalBenefits
              humanCallsPerMonth={humanCallsPerMonth}
              aiCallsPerMonth={aiCallsPerMonth}
              aiSimultaneousCalls={aiSimultaneousCalls}
            />
          </div>

          <div className="flex justify-end pt-4">
            <PDFDownloadLink
              document={<ReportPDF data={reportData} />}
              fileName="chatsites-cost-analysis.pdf"
              className="w-full"
            >
              {({ loading }) => (
                <Button
                  disabled={loading}
                  className="w-full gap-2 bg-brand hover:bg-brand-dark"
                >
                  <Download className="w-4 h-4" />
                  {loading ? "Generating PDF..." : "Download PDF Report"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};