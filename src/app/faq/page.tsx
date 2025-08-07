
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
    {
        question: "What is Astryde?",
        answer: "Astryde is a learning platform designed to help you master technology by providing curated video playlists from the best creators. It allows you to track your progress, stay motivated with streaks, and earn badges for your achievements."
    },
    {
        question: "How do I track my progress?",
        answer: "For each video in a learning path, you can set a status: 'Not Started', 'In Progress', or 'Completed'. This progress is saved to your profile, so you can easily see where you left off and how far you've come."
    },
    {
        question: "What are learning streaks and badges?",
        answer: "Learning streaks track the number of consecutive days you complete at least one video, helping you build a consistent learning habit. Badges are achievements you unlock for mastering a technology or completing all videos from a specific creator."
    },
    {
        question: "Can I suggest new content?",
        answer: "Absolutely! We encourage users to help expand our learning galaxy. You can visit the 'Contact Us' page to suggest new technologies, creators, or video playlists you'd like to see on the platform."
    },
    {
        question: "Is Astryde free to use?",
        answer: "Yes, Astryde is completely free. Our mission is to make knowledge accessible to everyone, and we believe that cost should not be a barrier to learning."
    },
    {
        question: "How do I start learning?",
        answer: "Simply navigate to the 'Courses' page, choose a technology you're interested in, select a creator, and start watching their videos. Your progress will be tracked automatically as you update the status of each video."
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

      <style jsx>{`
            .bg-grid-pattern {
                background-image: linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
                background-size: 40px 40px;
            }
       `}</style>
    </div>
  );
}
