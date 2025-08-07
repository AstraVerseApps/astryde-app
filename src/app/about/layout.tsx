
"use client";

import Header from '@/components/header';
import * as React from 'react';

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
    <Header />
    <main className="flex-1">
        {children}
    </main>
    </>
  );
}
