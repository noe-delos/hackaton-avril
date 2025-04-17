// app/components/WelcomePage.tsx
"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarDays, Sparkles } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();

  const handleClick = () => {
    toast.info("Bienvenue sur IntelliPlan.ai!");
    router.push("/context");
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center space-y-12 p-8 max-w-3xl">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <div className="bg-white p-4 rounded-full shadow-md mb-4">
            <CalendarDays className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-blue-800 tracking-tight">
            IntelliPlan.ai
          </h1>
        </motion.div>

        <motion.p
          className="text-xl text-blue-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Optimisez votre emploi du temps pour atteindre vos objectifs
          professionnels grâce à l'intelligence artificielle.
        </motion.p>

        <motion.div
          className="bg-white p-6 rounded-xl shadow-sm border border-blue-100"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Comment ça fonctionne
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center text-blue-800 font-bold">
                1
              </div>
              <h3 className="font-medium">Votre contexte professionnel</h3>
              <p className="text-sm text-gray-600">
                Nous générons un contexte professionnel avec vos collègues et
                objectifs.
              </p>
            </div>
            <div className="space-y-2">
              <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center text-blue-800 font-bold">
                2
              </div>
              <h3 className="font-medium">Vos contraintes</h3>
              <p className="text-sm text-gray-600">
                Définissez vos préférences et contraintes de planning.
              </p>
            </div>
            <div className="space-y-2">
              <div className="rounded-full bg-blue-100 w-8 h-8 flex items-center justify-center text-blue-800 font-bold">
                3
              </div>
              <h3 className="font-medium">Votre calendrier optimal</h3>
              <p className="text-sm text-gray-600">
                Nous créons un calendrier optimisé pour atteindre vos objectifs.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Button
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-xl rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Démarrer
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
