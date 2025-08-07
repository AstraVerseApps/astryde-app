
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
    {
        question: "What is Astryde?",
        answer: "Astryde is a learning platform designed to help you master technology by providing curated video playlists from the best creators. It helps you structure your learning, track your progress, and stay motivated."
    },
    {
        question: "How do I sign up or log in?",
        answer: "You can easily sign in using your Google account. Just click the 'Login' or 'Join the Mission' button, and you'll be prompted to log in with Google. This keeps the process simple and secure."
    },
    {
        question: "Is Astryde free to use?",
        answer: "Yes, absolutely! Our mission is to make knowledge accessible. Astryde is, and always will be, completely free for everyone."
    },
    {
        question: "How is the content organized?",
        answer: "Content is organized in a clear hierarchy. You first choose a broad 'Technology' (like Python), then select a 'Creator' who has made a playlist on that topic, and finally, you can watch the 'Videos' in that series."
    },
    {
        question: "How do I track my progress?",
        answer: "For each video, you can set a status: 'Not Started', 'In Progress', or 'Completed'. Your progress is automatically saved to your profile, allowing you to see how far you've come and easily pick up where you left off."
    },
    {
        question: "Where can I see my active courses?",
        answer: "The 'Progress' page is your focused dashboard. It only shows technologies and creators where you've started at least one video, completed a video, or starred a creator, helping you focus on your active learning."
    },
    {
        question: "What are learning streaks?",
        answer: "Learning streaks track the number of consecutive days you complete at least one video. It's a fun way to build a consistent learning habit and stay motivated."
    },
    {
        question: "How do I earn achievement badges?",
        answer: "You can earn badges for reaching milestones. You'll get a 'Tech Master' badge for completing all videos in a technology, and a 'Creator Fan' badge for completing all videos by a specific creator within a technology."
    },
    {
        question: "Where can I see my stats and badges?",
        answer: "The 'Analytics' page provides a detailed view of your learning journey. You can see your learning streak, all the badges you've unlocked, and a chart breaking down your progress across different technologies."
    },
    {
        question: "Can I suggest new content?",
        answer: "Definitely! We rely on our community to grow. If you have a favorite creator or a great video playlist you'd like to see on the platform, please submit it through our 'Contact Us' page."
    },
    {
        question: "Does the platform have a dark mode?",
        answer: "Yes, it does. You can switch between light and dark themes using the theme toggle in the header to ensure a comfortable viewing experience, day or night."
    },
    {
        question: "How do you choose the creators and content?",
        answer: "Our initial content is curated to provide high-quality learning paths. However, the platform is built to grow based on user suggestions. We review all submissions to ensure they are high-quality and relevant."
    },
    {
        question: "How can I become a verified creator?",
        answer: "Currently, creator verification is handled internally. If you are a content creator and would like to have your playlists featured, please get in touch with us through the 'Contact Us' page to discuss the opportunity."
    },
    {
        question: "Can I use Astryde on my mobile device?",
        answer: "Yes, Astryde is fully responsive and designed to work seamlessly on desktops, tablets, and mobile phones, so you can learn anytime, anywhere."
    }
];

export default function FAQPage() {
  return (
    <div className="bg-background text-foreground">
      <section className="relative py-20 md:py-32 text-center bg-muted/30">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20"></div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? We've got answers. Here are some common questions about Astryde and how it works.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

       <section className="py-16 md:py-24 border-t">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">Still Have Questions?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            If you couldn't find the answer you were looking for, feel free to reach out to us directly. We're always here to help.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>

      <style jsx>{`
            .bg-grid-pattern {
                background-image: linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
                background-size: 40px 40px;
            }
       `}</style>
    </div>
  );
}
