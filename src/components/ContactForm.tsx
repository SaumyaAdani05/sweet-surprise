'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/AppContext';
import { Loader2, Send, LogIn } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, notifications } = useApp();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Pre-fill name when user logs in
  useEffect(() => {
    if (user && user.name) {
      form.setValue('name', user.name);
    }
  }, [user, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        toast({
          title: "Message Sent!",
          description: `Thank you, ${values.name}. We have received your message and will get back to you shortly!`,
          className: "bg-primary text-primary-foreground border-none shadow-xl",
        });

        form.reset();
        if (user && user.name) {
          form.setValue('name', user.name);
        }
      } else {
        toast({
          title: "Error Sending Message",
          description: data.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Error Sending Message",
        description: "Network error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If user is not logged in, show a login prompt
  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-background p-8 md:p-10 rounded-xl shadow-md border text-center space-y-6">
        <div className="p-4 bg-primary/10 text-primary rounded-full inline-flex mx-auto">
          <Send className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-headline font-bold text-foreground">
          Login to Send a Message
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Please log in to your account before contacting us. This helps us respond to you faster with your order details.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2 w-full max-w-xs mx-auto">
          <Link href="/login?redirect=/#contact">
            <LogIn className="w-4 h-4 mr-2" />
            <span>Login to Continue</span>
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto bg-background p-6 md:p-8 rounded-xl shadow-md border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} className="focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jane@example.com" {...field} className="focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Custom cake inquiry, catering, etc." {...field} className="focus-visible:ring-primary" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us details about your order or questions..." 
                  rows={5} 
                  {...field} 
                  className="focus-visible:ring-primary resize-none" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
