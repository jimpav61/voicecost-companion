import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Prospect } from "./types";
import { useReportCalculations } from "../calculator/report/ReportCalculations";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "../calculator/report/ReportPDF";

export const useProspects = () => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [newCostPerMinute, setNewCostPerMinute] = useState<number | ''>('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const fetchProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('client_pricing')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProspects(data || []);
    } catch (error: any) {
      toast.error("Failed to load prospects");
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const updateProspectPrice = async (prospectId: string, newPrice: number) => {
    try {
      const { error } = await supabase
        .from('client_pricing')
        .update({ 
          cost_per_minute: newPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', prospectId);

      if (error) throw error;
      
      await fetchProspects(); // Refresh the list after update
      return true;
    } catch (error: any) {
      console.error("Error updating prospect price:", error);
      toast.error("Failed to update price");
      return false;
    }
  };

  const handleSendReport = async (prospect: Prospect) => {
    if (!newCostPerMinute) {
      toast.error("Please enter a new cost per minute");
      return;
    }

    try {
      setSending(true);

      // First update the price
      const updateSuccess = await updateProspectPrice(prospect.id, newCostPerMinute);
      if (!updateSuccess) {
        throw new Error("Failed to update price");
      }

      // Use the new individual price for this prospect's report
      const calculations = useReportCalculations({
        minutes: prospect.minutes,
        costPerMinute: newCostPerMinute,
      });

      const reportData = {
        formData: {
          name: prospect.client_name,
          companyName: prospect.company_name,
          email: prospect.email,
          phone: prospect.phone || '',
          minutes: prospect.minutes,
        },
        calculations,
        date: new Date().toLocaleDateString(),
      };

      // Create PDF document
      const pdfDoc = pdf(ReportPDF({ data: reportData }));
      const asPdf = await pdfDoc.toBlob();
      const pdfBase64 = await blobToBase64(asPdf);

      // Sanitize email address by trimming whitespace
      const sanitizedEmail = prospect.email.trim();
      console.log("Sending report to email:", sanitizedEmail);

      const { data, error } = await supabase.functions.invoke('send-report', {
        body: {
          to: [sanitizedEmail],
          subject: 'Updated Voice AI Cost Analysis',
          html: `
            <p>Hello ${prospect.client_name},</p>
            <p>Please find attached your updated Voice AI cost analysis report.</p>
            <p>Best regards,<br/>Your Voice AI Team</p>
          `,
          attachments: [{
            content: pdfBase64,
            filename: 'voice-ai-analysis.pdf',
          }],
        },
      });

      if (error) {
        console.error("Error from send-report function:", error);
        throw error;
      }

      console.log("Report sent successfully:", data);
      toast.success("Report sent successfully");
      fetchProspects();
    } catch (error: any) {
      console.error("Detailed error:", error);
      toast.error("Failed to send report");
    } finally {
      setSending(false);
      setSelectedProspect(null);
      setNewCostPerMinute('');
      setShowPreview(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  return {
    prospects,
    loading,
    selectedProspect,
    newCostPerMinute,
    sending,
    showPreview,
    setSelectedProspect,
    setNewCostPerMinute,
    setShowPreview,
    handleSendReport,
  };
};