import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { downloadKnowledgeBase } from "@/utils/exportStayLiteData";
import { useToast } from "@/hooks/use-toast";

export default function ExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const success = await downloadKnowledgeBase();
      if (success) {
        toast({
          title: "Export successful",
          description: "Knowledge base downloaded as text file",
        });
      } else {
        toast({
          title: "Export failed",
          description: "There was an error exporting the data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 mt-20">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Export StayLite Knowledge Base
            </CardTitle>
            <CardDescription>
              Download all StayLite data for ElevenLabs AI Agent integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">What's included:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted">
                <li>All property listings with details, amenities, and pricing</li>
                <li>Company policies (cancellation, house rules, safety)</li>
                <li>Frequently Asked Questions</li>
                <li>Company information and contact details</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Instructions for ElevenLabs:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted">
                <li>Click the button below to download the knowledge base file</li>
                <li>Go to your ElevenLabs Agent dashboard</li>
                <li>Navigate to the Knowledge Base section</li>
                <li>Upload the downloaded .txt file</li>
                <li>The agent will now have access to all StayLite information</li>
              </ol>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Download Knowledge Base"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
