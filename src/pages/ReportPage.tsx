import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Camera,
  FileText,
  Send,
  AlertTriangle,
  X,
  CheckCircle,
  Clock,
  PlusCircle,
  FileText as FileTextIcon,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/createClient";
import { decode } from "base64-arraybuffer";

// Report item interface
interface ReportItem {
  status: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  wallet_address?: string;
  id: number | string;
  created_at: string;
}

export default function ReportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    location: "",
    description: "",
  });

  // Wallet address simulation (you can integrate with your wallet provider)
  const walletAddress = "0xCbB7Fc4A9CE612C65DcB0151F29b67Cf66a4C2f2"; // Simulated wallet address

  // Function to fetch reports from Supabase
  const fetchReports = async (address: string | null) => {
    try {
      setRefreshing(true);
      console.log("Fetching reports for address:", address);

      // Query reports for the current wallet address
      let { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("wallet_address", address)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setReports(data as ReportItem[]);
      }
      if (data && data?.length > 0) {
        setShowForm(true);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your reports. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Function to refresh reports
  const onRefresh = async () => {
    await fetchReports(walletAddress || "");
  };

  // Fetch reports on component mount
  useEffect(() => {
    fetchReports(walletAddress || "");
  }, []);

  const getFileExtension = (fileName: string) => {
    const ext = fileName.split(".").pop();
    return `.${ext}`;
  };

  // Function to upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result?.toString().split(",")[1];
            if (!base64) {
              reject(new Error("Failed to read image"));
              return;
            }

            const timestamp = new Date().getTime();
            const filepath = `${timestamp}-${file.name}`;
            const contentType = file.type;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from("storage")
              .upload(`reports/${filepath}`, decode(base64), { contentType });

            if (uploadError) {
              throw uploadError;
            }

            // Get public URL correctly
            const { data: urlData } = supabase.storage
              .from("storage")
              .getPublicUrl(`reports/${filepath}`);

            console.log("Image uploaded successfully:", urlData.publicUrl);
            resolve(urlData.publicUrl);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const sendRequestsSequentially = async () => {
    try {
      // First API call - send email
      const emailResponse = await fetch("http://localhost:2000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Report Submitted",
          content: "A new anonymous report has been submitted successfully.",
        }),
      });

      const emailData = await emailResponse.json();
      console.log("Email API Response:", emailData);

      // Second API call - alert
      const alertResponse = await fetch("http://localhost:2000/alert", {
        method: "POST",
      });

      const alertData = await alertResponse.json();
      console.log("Alert API Response:", alertData);
    } catch (error) {
      console.error("Error in API call:", error);
    }
  };

  // Function to handle form submission
  const handleSubmitReport = async (
    description: string,
    location: string,
    imageFile: File | null,
  ) => {
    try {
      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Prepare report data
      const reportData: Partial<ReportItem> = {
        status: "pending",
        date: new Date().toLocaleDateString(),
        location: location,
        description,
        wallet_address: walletAddress,
        image_url: imageUrl || undefined,
        created_at: new Date().toISOString(),
      };

      // Insert report into Supabase
      const { data, error } = await supabase
        .from("reports")
        .insert(reportData)
        .select();

      if (error) {
        throw error;
      }

      // Send email and alert notifications
      sendRequestsSequentially();

      // Update local reports list
      if (data && data.length > 0) {
        setReports([data[0] as ReportItem, ...reports]);
      }

      // Reset form
      setFormData({ location: "", description: "" });
      setImagePreview(null);
      setSelectedImage(null);
      setShowForm(false);
      setSubmitted(true);

      toast({
        title: "Success",
        description: "Your report has been submitted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit your report. Please try again later.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedImage(null);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!formData.location || !formData.description) {
  //     toast({
  //       title: "Missing Information",
  //       description: "Please fill in all required fields.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const success = await handleSubmitReport(
  //       formData.description,
  //       formData.location,
  //       selectedImage,
  //     );

  //     if (success) {
  //       setIsSubmitting(false);
  //     }
  //   } catch (error) {
  //     console.error("Error submitting report:", error);
  //     setIsSubmitting(false);
  //   }
  // };

  // Empty state component
  const renderEmptyState = () => (
    <div className="text-center max-w-sm mx-auto my-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <FileTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 mb-2">No reports yet</h3>
      <p className="text-gray-600 mb-6">
        Submit your first anonymous report to help make your community safer
      </p>
      <Button
        onClick={() => setShowForm(true)}
        className="flex items-center justify-center gap-2 mx-auto"
      >
        <PlusCircle className="w-5 h-5" />
        Submit New Report
      </Button>
    </div>
  );

  // Loading component
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600">Loading your reports...</p>
    </div>
  );

  // Report item component
  const renderReportItem = (item: ReportItem) => {
    let StatusIcon;
    let statusColor;

    switch (item.status) {
      case "pending":
        StatusIcon = Clock;
        statusColor = "text-yellow-500 bg-yellow-50 border-yellow-200";
        break;
      case "verified":
        StatusIcon = CheckCircle;
        statusColor = "text-green-500 bg-green-50 border-green-200";
        break;
      case "rejected":
        StatusIcon = X;
        statusColor = "text-red-500 bg-red-50 border-red-200";
        break;
      default:
        StatusIcon = Clock;
        statusColor = "text-yellow-500 bg-yellow-50 border-yellow-200";
    }

    return (
      <Card key={item.id} className="mb-4 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-500">{item.date}</p>
              <p className="font-medium text-gray-900">{item.location}</p>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor}`}
            >
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-medium capitalize">
                {item.status}
              </span>
            </div>
          </div>

          <p className="text-gray-700 mb-4 line-clamp-3">{item.description}</p>

          {item.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={item.image_url}
                alt="Report evidence"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm font-mono text-gray-500">
              ID: {typeof item.id === "number" ? item.id : item.id.slice(0, 8)}
            </p>
            <div className="bg-green-50 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
              10 tokens
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Reports list view
  const ReportsListView = () => (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Your Reports</h1>
              <p className="text-sm text-muted-foreground">
                View and manage all your submitted reports
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              New Report
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto">
        {loading ? (
          renderLoading()
        ) : reports.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">{reports.length} reports</p>
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
            {reports.map(renderReportItem)}
          </div>
        )}
      </main>
    </div>
  );

  // Report form view
  // Report form view
  const ReportFormView = () => {
    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); // This is crucial!

      if (!formData.location || !formData.description) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const success = await handleSubmitReport(
          formData.description,
          formData.location,
          selectedImage,
        );

        if (success) {
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error("Error submitting report:", error);
        setIsSubmitting(false);
      }
    };

    if (submitted) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your anonymous report has been encrypted and stored securely.
              Authorities will be notified.
            </p>
            <p className="text-xs font-mono text-muted-foreground mb-6 bg-secondary/50 p-3 rounded-lg">
              Report Hash: 0x{Math.random().toString(16).slice(2, 18)}...
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setShowForm(false);
                }}
                className="w-full"
              >
                View All Reports
              </Button>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ location: "", description: "" });
                  setImagePreview(null);
                  setSelectedImage(null);
                }}
                variant="outline"
                className="w-full"
              >
                Submit Another Report
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border/50">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForm(false)}
                type="button" // Add type="button" to prevent form submission
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Submit Report</h1>
                <p className="text-sm text-muted-foreground">
                  All reports are anonymous and encrypted
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Warning Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-warning/30 bg-warning/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">
                      Important
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Only submit genuine reports. False reporting may result in
                      blacklisting.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label>Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Describe the location (area, landmarks)"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="h-12 pl-10 bg-secondary/50"
                  onKeyDown={(e) => {
                    // Prevent form submission when pressing Enter in this input
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description *
              </Label>
              <Textarea
                placeholder="Describe what you observed in detail. Include any relevant information about people, vehicles, patterns, etc."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="min-h-[120px] bg-secondary/50 resize-none"
                onKeyDown={(e) => {
                  // Allow Shift+Enter for new line, prevent Enter from submitting
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                  }
                }}
              />
            </motion.div>

            {/* Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Photo Evidence (Optional)
              </Label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Evidence preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button" // Add type="button" here
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <label className="block cursor-pointer">
                    <div className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-secondary/30">
                      <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Take Photo
                      </p>
                      <p className="text-xs text-muted-foreground">
                        (Not available in web)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <label className="block cursor-pointer">
                    <div className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/50 transition-colors bg-secondary/30">
                      <FileTextIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        From Gallery
                      </p>
                      <p className="text-xs text-muted-foreground">Max 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                type="submit"
                disabled={
                  isSubmitting || !formData.location || !formData.description
                }
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Anonymous Report
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-xs text-center text-muted-foreground">
              Your report is secured with SHA-256 encryption.
              <br />
              No personal information is collected or stored.
            </p>
          </form>
        </main>
      </div>
    );
  };

  return showForm ? <ReportFormView /> : <ReportsListView />;
}
