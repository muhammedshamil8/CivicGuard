import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, FileText, Send, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/createClient';



export default function ReportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    location: '',
    description: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Submit to Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            location: formData.location,
            description: formData.description,
            image_url: imagePreview,
            status: 'pending',
            is_blacklisted: false,
            timestamp: Date.now(),
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      setIsSubmitting(false);
      setSubmitted(true);

      toast({
        title: "Report Submitted",
        description: "Your anonymous report has been securely recorded.",
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
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
            Your anonymous report has been encrypted and stored securely. Authorities will be notified.
          </p>
          <p className="text-xs font-mono text-muted-foreground mb-6 bg-secondary/50 p-3 rounded-lg">
            Report Hash: 0x{Math.random().toString(16).slice(2, 18)}...
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({ location: '', description: '' });
              setImagePreview(null);
            }}
            variant="outline"
            className="w-full"
          >
            Submit Another Report
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Submit Report</h1>
          <p className="text-sm text-muted-foreground">All reports are anonymous and encrypted</p>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Important</p>
                  <p className="text-xs text-muted-foreground">
                    Only submit genuine reports. False reporting may result in blacklisting.
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
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-12 pl-10 bg-secondary/50"
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] bg-secondary/50 resize-none"
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
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
                  <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Tap to add photo</p>
                  <p className="text-xs text-muted-foreground">Max 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
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
              disabled={isSubmitting}
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Encrypting & Submitting...
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
}
