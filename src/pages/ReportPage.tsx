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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/createClient";
import { decode } from "base64-arraybuffer";

/* ================= TYPES ================= */

interface ReportItem {
  id: number | string;
  status: string;
  date: string;
  location: string;
  description: string;
  image_url?: string;
  wallet_address?: string;
  created_at: string;
}

/* ================= REPORT FORM ================= */

function ReportFormView({
  onBack,
  onSubmit,
  isSubmitting,
}: {
  onBack: () => void;
  onSubmit: (
    location: string,
    description: string,
    image: File | null,
  ) => Promise<void>;
  isSubmitting: boolean;
}) {
  const { toast } = useToast();

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const sendRequestsSequentially = async () => {
    try {
      // First API call - send email
      const emailResponse = await fetch("https://civic-guard-puej.vercel.app/send-email", {
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
      const alertResponse = await fetch("https://civic-guard-puej.vercel.app/alert", {
        method: "POST",
      });

      const alertData = await alertResponse.json();
      console.log("Alert API Response:", alertData);
    } catch (error) {
      console.error("Error in API call:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location || !description) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(location, description, imageFile);
    await sendRequestsSequentially();
    setLocation("");
    setDescription("");
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} type="button">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Submit Report</h1>
            <p className="text-sm text-muted-foreground">
              Anonymous & encrypted
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning */}
          <motion.div initial={false} animate={{ opacity: 1 }}>
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="text-warning" />
                <p className="text-sm">
                  Only submit genuine reports. False reports may be blocked.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12"
                placeholder="Area / landmark"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              placeholder="Describe what you observed"
            />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Photo Evidence (optional)</Label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={imagePreview}
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1"
                >
                  <X />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <div className="h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center">
                  <Camera />
                  <span className="text-sm mt-2">Upload Image</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Anonymous Report"}
          </Button>
        </form>
      </main>
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function ReportPage() {
  const { toast } = useToast();

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const walletAddress =
    "0xCbB7Fc4A9CE612C65DcB0151F29b67Cf66a4C2f2";

  const fetchReports = async () => {
    const { data } = await supabase
      .from("reports")
      .select("*")
      .eq("wallet_address", walletAddress)
      .order("created_at", { ascending: false });

    if (data) setReports(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const uploadImage = async (file: File) => {
    const reader = new FileReader();

    return new Promise<string | null>((resolve) => {
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1];
        if (!base64) return resolve(null);

        const path = `reports/${Date.now()}-${file.name}`;
        await supabase.storage
          .from("storage")
          .upload(path, decode(base64), { contentType: file.type });

        const { data } = supabase.storage
          .from("storage")
          .getPublicUrl(path);

        resolve(data.publicUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmitReport = async (
    location: string,
    description: string,
    image: File | null,
  ) => {
    setIsSubmitting(true);

    const imageUrl = image ? await uploadImage(image) : null;

    await supabase.from("reports").insert({
      location,
      description,
      image_url: imageUrl,
      status: "pending",
      wallet_address: walletAddress,
      date: new Date().toLocaleDateString(),
      created_at: new Date().toISOString(),
    });

    toast({ title: "Report submitted successfully" });

    setIsSubmitting(false);
    setShowForm(false);
    fetchReports();
  };

  if (showForm) {
    return (
      <ReportFormView
        onBack={() => setShowForm(false)}
        onSubmit={handleSubmitReport}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-xl font-bold">Your Reports</h1>
        <Button onClick={() => setShowForm(true)}>
          <PlusCircle className="mr-2" />
          New Report
        </Button>
      </div>

      {reports.length === 0 ? (
        <p>No reports yet</p>
      ) : (
        reports.map((r) => (
          <Card key={r.id} className="mb-4">
            <CardContent className="p-4">
              <p className="font-medium">{r.location}</p>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
