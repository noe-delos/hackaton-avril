// components/Calendar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  isWithinInterval,
  isSameDay,
  addWeeks,
  nextMonday,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent, MockContext } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  Info,
  Calendar as CalendarIcon,
  Filter,
  Target,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CalendarProps {
  events: CalendarEvent[];
  onRegenerate?: () => void;
}

export function Calendar({ events, onRegenerate }: CalendarProps) {
  // Start from next Monday by default
  const [currentDate, setCurrentDate] = useState(() => {
    return nextMonday(new Date()); // Toujours commencer au lundi prochain
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [context, setContext] = useState<MockContext | null>(null);
  const [constraints, setConstraints] = useState<{
    constraints: { id: string; description: string }[];
    workingHoursStart: string;
    workingHoursEnd: string;
    meetingDensity: "light" | "medium" | "heavy";
  } | null>(null);

  // Load context and constraints from localStorage on component mount
  useEffect(() => {
    const savedContext = localStorage.getItem("mockContext");
    const savedConstraints = localStorage.getItem("calendarConstraints");

    if (savedContext) {
      setContext(JSON.parse(savedContext));
    }

    if (savedConstraints) {
      setConstraints(JSON.parse(savedConstraints));
    }
  }, []);

  // Get start of week (Monday) for the current date
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

  // Create array of days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Format hours for display (working hours from constraints or default 9:00 to 18:00)
  const startHour = constraints
    ? parseInt(constraints.workingHoursStart.split(":")[0])
    : 9;
  const endHour = constraints
    ? parseInt(constraints.workingHoursEnd.split(":")[0]) + 1
    : 19; // +1 to include the end hour
  const hours = Array.from(
    { length: endHour - startHour },
    (_, i) => `${(i + startHour).toString().padStart(2, "0")}:00`
  );

  // Function to filter events for specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = parseISO(event.startTime);
      return isSameDay(eventStart, day);
    });
  };

  // Function to position and calculate height of event
  const getEventStyle = (event: CalendarEvent) => {
    const startTime = parseISO(event.startTime);
    const endTime = parseISO(event.endTime);

    // Calculate position from top (based on start time)
    const startHourValue = startTime.getHours() + startTime.getMinutes() / 60;
    const endHourValue = endTime.getHours() + endTime.getMinutes() / 60;

    const top = Math.max(0, (startHourValue - startHour) * 60); // startHour is the first hour, each hour is 60px
    const height = Math.max(30, (endHourValue - startHourValue) * 60); // Minimum height of 30px

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Function to navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentDate((prevDate) => addDays(prevDate, -7));
  };

  // Function to navigate to next week
  const goToNextWeek = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 7));
  };

  // Determine if an event is flexible based on description
  const isEventFlexible = (event: CalendarEvent) => {
    const flexibleKeywords = [
      "flexible",
      "peut être déplacé",
      "optionnel",
      "si disponible",
    ];
    return flexibleKeywords.some((keyword) =>
      event.description.toLowerCase().includes(keyword)
    );
  };

  // Function to get background color based on event title and objective
  const getEventColor = (event: CalendarEvent) => {
    // If event has an objective reference, use it to determine color
    if (context && event.description.includes("Objectif")) {
      if (event.description.includes("Objectif 1")) {
        return "bg-blue-100 border-blue-300 text-blue-800";
      } else if (event.description.includes("Objectif 2")) {
        return "bg-green-100 border-green-300 text-green-800";
      } else if (event.description.includes("Objectif 3")) {
        return "bg-purple-100 border-purple-300 text-purple-800";
      }
    }

    // Fallback to random but consistent colors based on event title
    const hash = event.title.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const colorOptions = [
      "bg-amber-100 border-amber-300 text-amber-800",
      "bg-rose-100 border-rose-300 text-rose-800",
      "bg-cyan-100 border-cyan-300 text-cyan-800",
      "bg-indigo-100 border-indigo-300 text-indigo-800",
      "bg-emerald-100 border-emerald-300 text-emerald-800",
    ];

    return colorOptions[Math.abs(hash) % colorOptions.length];
  };

  // Height of calendar grid based on number of hours
  const gridHeight = hours.length * 60;

  return (
    <div className="w-full">
      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="objectives">Objectifs</TabsTrigger>
            <TabsTrigger value="constraints">Contraintes</TabsTrigger>
          </TabsList>

          {/* Bouton de régénération en haut à droite */}
          {onRegenerate && (
            <Button
              onClick={onRegenerate}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Regénérer
            </Button>
          )}
        </div>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">
              {format(weekStart, "MMMM yyyy", { locale: fr })}
            </h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-8 border rounded">
            {/* Time labels */}
            <div className="col-span-1 border-r bg-gray-50">
              <div className="h-12 border-b flex items-center justify-center font-medium bg-gray-100">
                Heure
              </div>
              {hours.map((hour, index) => (
                <div
                  key={index}
                  className="h-[60px] border-b pl-2 pr-2 text-sm text-gray-500 flex items-center justify-center"
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Days of the week */}
            <div className="col-span-7 grid grid-cols-7">
              {/* Day headers */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="h-12 border-b border-r px-2 py-2 text-center bg-gray-100"
                >
                  <div className="font-medium">
                    {format(day, "EEEE", { locale: fr })}
                  </div>
                  <div className="text-sm">
                    {format(day, "d MMM", { locale: fr })}
                  </div>
                </div>
              ))}

              {/* Time slots with events */}
              {weekDays.map((day, dayIndex) => (
                <div
                  key={`grid-${dayIndex}`}
                  className="relative border-r"
                  style={{ height: `${gridHeight}px` }}
                >
                  {/* Hour lines */}
                  {hours.map((_, hourIndex) => (
                    <div
                      key={`hour-${hourIndex}`}
                      className="absolute border-b border-gray-200 w-full"
                      style={{ top: `${hourIndex * 60}px`, height: "60px" }}
                    ></div>
                  ))}

                  {/* Events */}
                  <AnimatePresence>
                    {getEventsForDay(day).map((event, eventIndex) => (
                      <motion.div
                        key={`event-${dayIndex}-${eventIndex}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: eventIndex * 0.05 }}
                        className={`absolute left-1 right-1 p-1 rounded border shadow cursor-pointer overflow-hidden ${getEventColor(
                          event
                        )}`}
                        style={getEventStyle(event)}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="text-xs font-medium truncate flex items-center justify-between">
                          <span>{event.title}</span>
                          {/* Icône pour indiquer si l'événement est flexible ou non */}
                          {isEventFlexible(event) ? (
                            <Unlock className="h-3 w-3 text-amber-600" />
                          ) : (
                            <Lock className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="text-xs truncate">
                          {format(parseISO(event.startTime), "HH:mm", {
                            locale: fr,
                          })}{" "}
                          -
                          {format(parseISO(event.endTime), "HH:mm", {
                            locale: fr,
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap gap-4 p-4 border rounded bg-gray-50">
            <h3 className="font-medium w-full mb-2">Légende :</h3>

            <div className="flex flex-wrap gap-4">
              {/* Légende des objectifs */}
              {context &&
                context.currentUser.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center mr-4">
                    <div
                      className={`w-4 h-4 rounded-full mr-2 ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-green-500"
                          : "bg-purple-500"
                      }`}
                    ></div>
                    <span className="text-sm truncate">
                      Objectif {index + 1}
                    </span>
                  </div>
                ))}

              {/* Légende des événements flexibles/non flexibles */}
              <div className="flex items-center mr-4">
                <Lock className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm">Non flexible</span>
              </div>

              <div className="flex items-center">
                <Unlock className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm">Flexible</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="objectives">
          {context ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-lg">Mes objectifs</h3>
                  </div>

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
                        <div>
                          <p className="font-medium">{objective}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {index === 0
                              ? "Optimisé pour les matinées et début de semaine"
                              : index === 1
                              ? "Distribué à travers la semaine"
                              : "Planifié en fonction des plages horaires disponibles"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="bg-blue-50 p-4 rounded border border-blue-100">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      Optimisation du calendrier
                    </h4>
                    <p className="text-sm text-gray-700">
                      Votre calendrier a été optimisé pour maximiser vos chances
                      d'atteindre vos objectifs tout en respectant vos
                      contraintes. Les événements sont codés par couleur selon
                      l'objectif auquel ils contribuent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-6 text-gray-500">
              Chargement des objectifs...
            </div>
          )}
        </TabsContent>

        <TabsContent value="constraints">
          {constraints ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-lg">Mes contraintes</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm font-medium">Heures de travail</p>
                      <p className="mt-1">
                        {constraints.workingHoursStart} -{" "}
                        {constraints.workingHoursEnd}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border">
                      <p className="text-sm font-medium">
                        Densité des réunions
                      </p>
                      <p className="mt-1">
                        {constraints.meetingDensity === "light"
                          ? "Légère"
                          : constraints.meetingDensity === "medium"
                          ? "Moyenne"
                          : "Élevée"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      Préférences personnelles
                    </h4>
                    <ul className="space-y-2">
                      {constraints.constraints.map((constraint, index) => (
                        <li
                          key={index}
                          className="bg-blue-50 p-3 rounded border border-blue-100"
                        >
                          {constraint.description}
                        </li>
                      ))}
                    </ul>

                    {constraints.constraints.length === 0 && (
                      <p className="text-center text-gray-500 italic py-4">
                        Aucune contrainte personnalisée ajoutée
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-6 text-gray-500">
              Chargement des contraintes...
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="sm:max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEvent.title}</span>
                  {isEventFlexible(selectedEvent) ? (
                    <Badge className="bg-amber-500 flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Flexible
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Non flexible
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {format(
                    parseISO(selectedEvent.startTime),
                    "EEEE d MMMM yyyy",
                    { locale: fr }
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-600">
                    {format(parseISO(selectedEvent.startTime), "HH:mm", {
                      locale: fr,
                    })}{" "}
                    -
                    {format(parseISO(selectedEvent.endTime), "HH:mm", {
                      locale: fr,
                    })}
                  </Badge>
                </div>

                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">
                      {selectedEvent.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Participants</p>
                    <ul className="mt-1 space-y-1">
                      {selectedEvent.participants.map((participant, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {participant.name}{" "}
                          <span className="text-gray-500">
                            ({participant.role})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Add objective reference if available */}
                {selectedEvent.description.includes("Objectif") && context && (
                  <div className="mt-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium">Lié à l'objectif :</p>
                    {selectedEvent.description.includes("Objectif 1") && (
                      <p className="text-sm mt-1">
                        {context.currentUser.objectives[0]}
                      </p>
                    )}
                    {selectedEvent.description.includes("Objectif 2") && (
                      <p className="text-sm mt-1">
                        {context.currentUser.objectives[1]}
                      </p>
                    )}
                    {selectedEvent.description.includes("Objectif 3") && (
                      <p className="text-sm mt-1">
                        {context.currentUser.objectives[2]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
