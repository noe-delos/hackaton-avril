// app/constraints/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarConstraint, MockContext } from "@/types";
import { XCircle, BriefcaseBusiness, Clock, Users } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Example constraints that users can add
const exampleConstraints = [
  "Je n'aime pas avoir des réunions le matin",
  "Je préfère travailler sur les sujets importants en début de semaine",
  "Je ne suis pas disponible le jeudi de 14h à 16h",
  "J'ai besoin d'au moins 2 heures de temps concentré chaque jour",
  "Je préfère avoir mes réunions regroupées",
  "Je prends une pause déjeuner d'une heure entre 12h et 14h",
  "Je préfère commencer ma journée par du travail de réflexion",
  "J'aime garder mes vendredis après-midi pour les tâches administratives",
  "Je suis plus productif en fin de journée",
];

export default function ConstraintsPage() {
  const router = useRouter();
  const [newConstraint, setNewConstraint] = useState("");
  const [constraints, setConstraints] = useState<CalendarConstraint[]>([]);
  const [context, setContext] = useState<MockContext | null>(null);
  const [workingHoursStart, setWorkingHoursStart] = useState("09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState("18:00");
  const [meetingDensity, setMeetingDensity] = useState<
    "light" | "medium" | "heavy"
  >("medium");

  useEffect(() => {
    // Load context from localStorage
    const savedContext = localStorage.getItem("mockContext");
    if (savedContext) {
      setContext(JSON.parse(savedContext));
    } else {
      toast.error("Contexte non trouvé, retour à l'accueil");
      router.push("/");
    }
  }, [router]);

  const addConstraint = () => {
    if (newConstraint.trim() === "") return;

    setConstraints([
      ...constraints,
      { id: uuidv4(), description: newConstraint.trim() },
    ]);
    setNewConstraint("");
  };

  const removeConstraint = (id: string) => {
    setConstraints(constraints.filter((constraint) => constraint.id !== id));
  };

  const addExampleConstraint = (constraint: string) => {
    if (constraints.some((c) => c.description === constraint)) return;

    setConstraints([...constraints, { id: uuidv4(), description: constraint }]);
  };

  const handleGenerateCalendar = () => {
    if (!context) {
      toast.error("Contexte non trouvé");
      return;
    }

    // Store constraints in localStorage
    localStorage.setItem(
      "calendarConstraints",
      JSON.stringify({
        constraints,
        workingHoursStart,
        workingHoursEnd,
        meetingDensity,
      })
    );

    router.push("/generate");
  };

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const constraintVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  if (!context) {
    return (
      <div className="container mx-auto p-6 max-w-5xl text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">Chargement...</h1>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6 max-w-3xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Définissez vos contraintes de calendrier
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pour optimiser votre emploi du temps, indiquez vos préférences et
          contraintes de travail.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Heures de travail</CardTitle>
              <CardDescription>
                Définissez vos heures de travail habituelles
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début
                </label>
                <Input
                  type="time"
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <Input
                  type="time"
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Densité des réunions</CardTitle>
              <CardDescription>
                Combien de réunions souhaitez-vous avoir dans votre emploi du
                temps ?
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <Button
                variant={meetingDensity === "light" ? "default" : "outline"}
                onClick={() => setMeetingDensity("light")}
                className={`flex-1 ${
                  meetingDensity === "light" ? "bg-blue-600" : ""
                }`}
              >
                Légère
              </Button>
              <Button
                variant={meetingDensity === "medium" ? "default" : "outline"}
                onClick={() => setMeetingDensity("medium")}
                className={`flex-1 ${
                  meetingDensity === "medium" ? "bg-blue-600" : ""
                }`}
              >
                Moyenne
              </Button>
              <Button
                variant={meetingDensity === "heavy" ? "default" : "outline"}
                onClick={() => setMeetingDensity("heavy")}
                className={`flex-1 ${
                  meetingDensity === "heavy" ? "bg-blue-600" : ""
                }`}
              >
                Élevée
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-2 bg-gradient-to-r from-gray-50 to-blue-50">
            <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Préférences et contraintes</CardTitle>
              <CardDescription>
                Ajoutez vos préférences pour l'organisation de votre emploi du
                temps
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex mb-4">
              <Input
                type="text"
                placeholder="Ajouter une contrainte..."
                value={newConstraint}
                onChange={(e) => setNewConstraint(e.target.value)}
                className="flex-1 mr-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addConstraint();
                  }
                }}
              />
              <Button onClick={addConstraint} className="bg-blue-600">
                Ajouter
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Suggestions :</p>
              <div className="flex flex-wrap gap-2">
                {exampleConstraints.map((constraint, index) => (
                  <Badge
                    key={index}
                    className="cursor-pointer bg-gray-200 text-gray-800 hover:bg-blue-100"
                    onClick={() => addExampleConstraint(constraint)}
                  >
                    {constraint}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <AnimatePresence>
                {constraints.map((constraint) => (
                  <motion.div
                    key={constraint.id}
                    className="flex items-center bg-blue-50 p-3 rounded-md border border-blue-100"
                    variants={constraintVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <span className="flex-1">{constraint.description}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConstraint(constraint.id)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <XCircle size={18} />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {constraints.length === 0 && (
                <p className="text-center text-gray-500 italic py-4">
                  Aucune contrainte ajoutée
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="flex justify-between" variants={itemVariants}>
        <Button
          variant="outline"
          onClick={() => router.push("/context")}
          className="px-6"
        >
          Retour
        </Button>
        <Button
          onClick={handleGenerateCalendar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 text-lg rounded-full shadow-lg transition-all hover:shadow-xl"
        >
          Générer mon calendrier
        </Button>
      </motion.div>
    </motion.div>
  );
}
