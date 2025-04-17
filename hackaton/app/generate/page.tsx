// app/generate/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MockContext, CalendarResponse, CalendarEvent } from "@/types";
import { Calendar } from "@/components/Calendar";
import { Loader2, Calendar as CalendarIcon, RefreshCw } from "lucide-react";

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [context, setContext] = useState<MockContext | null>(null);
  const [constraints, setConstraints] = useState<{
    constraints: { id: string; description: string }[];
    workingHoursStart: string;
    workingHoursEnd: string;
    meetingDensity: "light" | "medium" | "heavy";
  } | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarEvent[] | null>(
    null
  );

  useEffect(() => {
    // Load context and constraints from localStorage
    const savedContext = localStorage.getItem("mockContext");
    const savedConstraints = localStorage.getItem("calendarConstraints");

    if (savedContext && savedConstraints) {
      setContext(JSON.parse(savedContext));
      setConstraints(JSON.parse(savedConstraints));
      setLoading(false);
    } else {
      toast.error("Données manquantes, retour à l'accueil");
      router.push("/");
    }
  }, [router]);

  const generateCalendar = async () => {
    if (!context || !constraints) return;

    setGenerating(true);

    try {
      // Calculate date range (next 7 days from today)
      const today = new Date();
      const startDate = today.toISOString().split("T")[0];
      const endDate = new Date(today.setDate(today.getDate() + 7))
        .toISOString()
        .split("T")[0];

      // Create request payload
      const requestPayload = {
        userRole: context.currentUser.job,
        startDate,
        endDate,
        workingHoursStart: constraints.workingHoursStart,
        workingHoursEnd: constraints.workingHoursEnd,
        meetingPreferences: constraints.constraints.map((c) => c.description),
        existingCommitments: context.meetings.filter((m) => !m.isFlexible),
        meetingDensity: constraints.meetingDensity,
        objectives: context.currentUser.objectives,
      };

      // Call API
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate calendar");
      }

      const data: CalendarResponse = await response.json();

      // Store the generated calendar
      setCalendarData(data.events);

      // Save to localStorage for persistence
      localStorage.setItem("generatedCalendar", JSON.stringify(data.events));

      toast.success("Calendrier généré avec succès !");
    } catch (error) {
      console.error("Error generating calendar:", error);
      toast.error("Erreur lors de la génération du calendrier");
    } finally {
      setGenerating(false);
    }
  };

  // Run generation on first load
  useEffect(() => {
    if (!loading && !generating && !calendarData) {
      generateCalendar();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Préparation de vos données...
        </h1>
        <Loader2 className="animate-spin mx-auto" size={48} />
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6 max-w-6xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Votre Calendrier Optimisé
        </h1>
        {context && (
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calendrier optimisé pour {context.currentUser.name},{" "}
            {context.currentUser.job} chez {context.companyName}
          </p>
        )}
      </motion.div>

      {generating ? (
        <div className="text-center p-12 border rounded-lg bg-white shadow-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-blue-700 mb-2">
              Génération de votre calendrier optimal...
            </h2>
            <p className="text-gray-600">
              L'IA analyse vos contraintes et objectifs pour créer le meilleur
              planning possible.
            </p>

            <div className="max-w-md mx-auto bg-blue-50 p-4 rounded-md border border-blue-100 text-left">
              <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Optimisation en cours
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 rounded-full bg-blue-500 mt-1 mr-2"></span>
                  <span>Planning des réunions obligatoires</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 rounded-full bg-green-500 mt-1 mr-2"></span>
                  <span>
                    Optimisation des plages de travail pour vos objectifs
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 rounded-full bg-purple-500 mt-1 mr-2"></span>
                  <span>Prise en compte de vos contraintes personnelles</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-4 h-4 rounded-full bg-amber-500 mt-1 mr-2"></span>
                  <span>
                    Allocation de temps pour la réflexion et les pauses
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {calendarData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="mb-8 shadow-sm border rounded-lg overflow-hidden">
                <CardContent className="p-0">
                  <Calendar
                    events={calendarData}
                    onRegenerate={generateCalendar}
                  />
                </CardContent>
              </Card>

              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => router.push("/constraints")}
                  className="mr-4"
                >
                  Modifier mes contraintes
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-12 border rounded-lg bg-white shadow-sm">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Échec de la génération du calendrier
              </h2>
              <p className="text-gray-600 mb-4">
                Une erreur s'est produite lors de la génération de votre
                calendrier.
              </p>
              <Button onClick={generateCalendar} className="bg-blue-600">
                Réessayer
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
