// app/context/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MockContext } from "@/types";

export default function ContextPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<MockContext | null>(null);

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch("/api/mock-context");
        if (!response.ok) {
          throw new Error("Failed to fetch context");
        }
        const data = await response.json();
        setContext(data);
      } catch (error) {
        console.error("Error fetching context:", error);
        toast.error("Erreur lors de la génération du contexte");
      } finally {
        setLoading(false);
      }
    };

    fetchContext();
  }, []);

  const handleContinue = () => {
    if (context) {
      // Store context in localStorage for later use
      localStorage.setItem("mockContext", JSON.stringify(context));
      router.push("/constraints");
    }
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="container mx-auto p-6 max-w-5xl text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Erreur</h1>
        <p className="mb-6">Impossible de générer le contexte professionnel</p>
        <Button onClick={() => router.push("/")}>Réessayer</Button>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto p-6 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="text-center mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-blue-800 mb-2">
          Votre Contexte Professionnel
        </h1>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 max-w-2xl mx-auto"
        >
          <p className="text-lg font-medium text-blue-700 mb-1">
            {context.companyName}
          </p>
          <p className="text-blue-600">{context.companyType}</p>
        </motion.div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Vous êtes{" "}
          <span className="font-semibold">{context.currentUser.name}</span>,{" "}
          {context.currentUser.job} chez {context.companyName}. Vous avez 3
          objectifs principaux à atteindre dans les prochains jours.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle>Vos Objectifs</CardTitle>
            <CardDescription>
              Les objectifs professionnels que vous cherchez à atteindre
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {context.currentUser.objectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <div
                    className={`flex items-center justify-center rounded-full w-6 h-6 mr-3 mt-0.5 text-white ${
                      index === 0
                        ? "bg-blue-500"
                        : index === 1
                        ? "bg-green-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="colleagues" className="mb-8">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="colleagues" className="flex-1">
            Collègues
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex-1">
            Réunions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colleagues">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
          >
            {context.colleagues.map((colleague) => (
              <motion.div key={colleague.id} variants={itemVariants}>
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <CardTitle>{colleague.name}</CardTitle>
                    <CardDescription>{colleague.job}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600">
                      {colleague.meetings.length} réunions programmées
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="meetings">
          <motion.div
            className="grid grid-cols-1 gap-4"
            variants={containerVariants}
          >
            {context.meetings.map((meeting) => (
              <motion.div key={meeting.id} variants={itemVariants}>
                <Card
                  className={`border-l-4 ${
                    meeting.isFlexible
                      ? "border-l-amber-400"
                      : "border-l-red-400"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{meeting.title}</CardTitle>
                      <Badge
                        className={
                          meeting.isFlexible ? "bg-amber-400" : "bg-red-400"
                        }
                      >
                        {meeting.isFlexible ? "Flexible" : "Non flexible"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {new Date(meeting.startTime).toLocaleString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(meeting.endTime).toLocaleString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">{meeting.description}</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-gray-600 mt-4">
                      <p>
                        <span className="font-semibold">Lieu:</span>{" "}
                        {meeting.location}
                      </p>
                      <p>
                        <span className="font-semibold">Participants:</span>{" "}
                        {meeting.participants
                          .map((id) => {
                            if (id === context.currentUser.id) {
                              return context.currentUser.name;
                            }
                            const colleague = context.colleagues.find(
                              (c) => c.id === id
                            );
                            return colleague ? colleague.name : id;
                          })
                          .join(", ")}
                      </p>
                    </div>
                    {meeting.objective && (
                      <div className="mt-4 p-2 bg-blue-50 rounded-md">
                        <Badge className="bg-blue-600 mb-1">
                          Objectif associé
                        </Badge>
                        <p className="text-sm">{meeting.objective}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 text-lg rounded-full shadow-lg transition-all hover:shadow-xl"
        >
          Définir mes contraintes
        </Button>
      </motion.div>
    </motion.div>
  );
}
