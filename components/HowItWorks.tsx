"use client"
import React from "react";
import { Card, CardHeader } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const demoTasks = [
  {
    column: "To Do",
    tasks: [
      {
        title: "Set up CRM for client",
        user: "Anna Svensson",
        avatar: "https://i.pravatar.cc/100?img=11",
      },
      {
        title: "Import company data",
        user: "Erik Johansson",
        avatar: "https://i.pravatar.cc/100?img=16",
      },
    ],
  },
  {
    column: "In Progress",
    tasks: [
      {
        title: "Invite team members",
        user: "Linda Berg",
        avatar: "https://i.pravatar.cc/100?img=21",
      },
    ],
  },
  {
    column: "Done",
    tasks: [
      {
        title: "Sync with Bolagsverket",
        user: "Marcus Nilsson",
        avatar: "https://i.pravatar.cc/100?img=31",
      },
    ],
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 px-4">
        {/* Vänster: Kanban + text */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-3xl font-bold mb-2 text-slate-800">
            How does it work?
          </h2>
          <p className="text-slate-600 mb-8 max-w-lg">
            Flowen connects powerful business data with real teamwork.{" "}
            <b>Visual Kanban boards</b> make tasks easy to follow, and every CRM
            entry is instantly enriched with official data from{" "}
            <span className="font-semibold text-blue-900">Bolagsverket</span>{" "}
            and <span className="font-semibold text-blue-900">SCB</span>.
          </p>

          {/* Kanban board: Grid på desktop, horisontell scroll på mobil */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-2 md:pb-0">
            {demoTasks.map((column) => (
              <div
                key={column.column}
                className="min-w-[300px] md:min-w-0 bg-white/90 rounded-2xl shadow-xl p-4 border border-slate-200"
              >
                <h3 className="font-semibold text-lg mb-3 text-slate-700 text-center">
                  {column.column}
                </h3>
                <div className="flex flex-col gap-4">
                  {column.tasks.map((task, idx) => (
                    <Card
                      key={idx}
                      className="bg-white/80 shadow-sm border-2 border-slate-200"
                    >
                      <CardHeader className="flex flex-col items-start gap-1 pb-2">
                        <div className="flex flex-row items-center gap-3 mb-2">
                          <Avatar>
                            <AvatarImage src={task.avatar} alt={task.user} />
                            <AvatarFallback>
                              {task.user
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{task.user}</p>
                          </div>
                        </div>
                        <p className="text-base text-slate-700">{task.title}</p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* CTA för demo */}
          <div className="mt-8 text-center">
            <a
              href="#"
              className="inline-block bg-blue-700 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-900 transition"
            >
              See Flowen in action
            </a>
          </div>
        </div>
        {/* Höger: Instant Available Data */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-gradient-to-tr from-blue-50 to-slate-100 p-6 rounded-xl shadow-lg text-center border">
            <h3 className="text-xl font-bold mb-2 text-slate-800">
              Instant Available Data from Bolagsverket &amp; SCB
            </h3>
            <p className="text-slate-600 mb-4">
              Instantly see official company registration details, industry
              codes, and key figures in your CRM – updated and verified.
            </p>
            {/* Byt ut mot riktig screenshot när du har data! */}
            <img
  src="/bildbolagsverket.png"
  alt="Company data preview from Bolagsverket & SCB"
  className="rounded-lg border mx-auto shadow bg-slate-200"
/>
            <p className="text-xs mt-4 text-slate-500">
              Integration with Bolagsverket &amp; SCB APIs
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
