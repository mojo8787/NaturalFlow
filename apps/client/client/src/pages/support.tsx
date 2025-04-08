import { useQuery, useMutation } from "@tanstack/react-query";
import { SupportTicket } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, LifeBuoy, Clock, CheckCircle, Droplet } from "lucide-react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { insertSupportTicketSchema } from "@shared/schema";
import { z } from "zod";
import { useState, useRef } from "react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

// Extend form schema to include image upload
const ticketFormSchema = insertSupportTicketSchema.pick({
  title: true,
  description: true,
}).extend({
  image: z.any().optional(),
});

type TicketFormData = z.infer<typeof ticketFormSchema>;

function getStatusIcon(status: string) {
  switch (status) {
    case "open":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "in_progress":
      return <Loader2 className="h-4 w-4 text-blue-500" />;
    case "resolved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
}

export default function SupportPage() {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
  });

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets"],
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Update form value
      form.setValue('image', file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (data.image) {
        formData.append('image', data.image);
      }
      
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      form.reset();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: t("ticketCreated"),
        description: t("ticketCreatedMessage"),
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <div className="flex h-16 items-center gap-4 border-b px-4 md:px-6">
        <MobileNav />
        <div className="flex items-center gap-2">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="font-semibold">PureFlow</span>
        </div>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 md:p-6 pt-6">
        <div className="grid gap-4 md:grid-cols-[200px_1fr]">
          <div className="hidden md:block">
            <DashboardNav />
          </div>

          <main className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">{t("support")}</h1>

            <Card>
              <CardHeader>
                <CardTitle>{t("createTicket")}</CardTitle>
                <CardDescription>
                  {t("supportTitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form 
                    onSubmit={form.handleSubmit((data) => createTicketMutation.mutate(data))} 
                    className="space-y-4"
                    encType="multipart/form-data"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ticketTitle")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("issueDescription")} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("ticketDescription")}</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder={t("fullDescription")}
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>{t("attachImage")}</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              id="image-upload"
                              name="image"
                            />
                          </FormControl>
                          <FormDescription>
                            {t("fullDescription")}
                          </FormDescription>
                          <FormMessage />
                          {imagePreview && (
                            <div className="mt-2">
                              <p className="text-sm mb-1">{t("view")}:</p>
                              <div className="relative w-full max-w-[200px] rounded-md overflow-hidden border">
                                <img src={imagePreview} alt="Preview" className="w-full h-auto" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                                  onClick={() => {
                                    setImagePreview(null);
                                    form.setValue('image', undefined);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                  }}
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          )}
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? t("creating") : t("createTicket")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t("myTickets")}</h2>
              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <LifeBuoy className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      {t("noReferralsYet")}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{ticket.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm capitalize text-muted-foreground">
                              {t(ticket.status.replace('_', ''))}
                            </span>
                          </div>
                        </div>
                        <CardDescription>
                          {t("dateCreated")}: {new Date(ticket.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">
                          {ticket.description}
                        </p>
                        {ticket.imageUrl && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">{t("attachImage")}:</p>
                            <div className="w-full max-w-[250px] rounded-md overflow-hidden border">
                              <img 
                                src={ticket.imageUrl} 
                                alt={t("attachImage")} 
                                className="w-full h-auto"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  console.error("Failed to load image");
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
