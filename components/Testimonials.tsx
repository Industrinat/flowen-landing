"use client"
import React from "react";
import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Testimonial = {
  id: number
  content: string
  name: string
  role: string
  company: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "This platform has transformed how our team collaborates. The intuitive interface and powerful features have boosted our productivity by 30%.",
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechInnovate",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    content: "I've tried many SaaS solutions, but this one stands out. The customer support is exceptional, and the product delivers on all its promises.",
    name: "Michael Chen",
    role: "Product Manager",
    company: "GrowthScale",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 3,
    content: "The ROI we've seen since implementing this solution has been incredible. It paid for itself within the first month.",
    name: "Emily Rodriguez",
    role: "CEO",
    company: "Upstart Ventures",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: 4,
    content: "What impressed me most was how seamlessly it integrated with our existing workflow. No disruption, just immediate benefits.",
    name: "David Kim",
    role: "Operations Director",
    company: "FlexSystems",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: 5,
    content: "The analytics dashboard alone is worth the investment. We now have insights we never had access to before.",
    name: "Aisha Patel",
    role: "Marketing Lead",
    company: "MetricsMatter",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
]

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 px-4 bg-slate-50 rounded-xl w-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
            Trusted by teams worldwide
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            See what our customers have to say about their experience with our platform.
          </p>
        </div>

        {/* Mobile view - Carousel */}
        <div className="md:hidden">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonials[activeIndex].avatar} alt={testimonials[activeIndex].name} />
                  <AvatarFallback>{testimonials[activeIndex].name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonials[activeIndex].name}</p>
                  <p className="text-sm text-slate-500">
                    {testimonials[activeIndex].role}, {testimonials[activeIndex].company}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="italic text-slate-700">"{testimonials[activeIndex].content}"</p>
            </CardContent>
            <CardFooter>
              <div className="flex justify-center w-full gap-1 mt-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      activeIndex === index ? "bg-slate-800 w-4" : "bg-slate-300"
                    )}
                    aria-label={"Go to testimonial " + (index + 1)}
                  />
                ))}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Tablet/Desktop view - Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id}
              className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <CardHeader className="pb-0">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="italic text-slate-700">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
