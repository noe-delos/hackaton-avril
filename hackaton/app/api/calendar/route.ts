// app/api/calendar/route.ts
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { CalendarRequest, CalendarResponse } from "@/types";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const calendarInfo: CalendarRequest = await request.json();

    // Build prompt for OpenAI
    const prompt = `
    Génère un planning de calendrier optimisé pour un ${
      calendarInfo.userRole
    } du ${calendarInfo.startDate} au ${calendarInfo.endDate}.
    
    Détails:
    - Heures de travail: ${calendarInfo.workingHoursStart} à ${
      calendarInfo.workingHoursEnd
    }
    - Préférences de réunion: ${calendarInfo.meetingPreferences.join(", ")}
    - Engagements existants: ${JSON.stringify(calendarInfo.existingCommitments)}
    - Densité des réunions: ${calendarInfo.meetingDensity}
    
    Objectifs à atteindre:
    ${calendarInfo.objectives.map((obj, i) => `${i + 1}. ${obj}`).join("\n")}
    
    Créer un calendrier optimal qui permettra à l'utilisateur d'atteindre ses objectifs tout en respectant ses contraintes. Inclure:
    
    1. Du temps dédié pour travailler sur chaque objectif
    2. Les réunions obligatoires (existantes et non flexibles)
    3. Les réunions reprogrammées de manière optimale (celles qui sont flexibles)
    4. Du temps pour la réflexion, la préparation et le suivi
    5. Des pauses et du temps personnel (déjeuner, etc.)
    
    IMPORTANT: Pour chaque événement créé qui concerne un objectif spécifique, inclus dans la description une mention claire comme "Lié à l'Objectif 1: [texte de l'objectif]". C'est crucial pour la visualisation dans l'interface.
    
    Pour chaque événement, fournir:
    - Titre (réaliste et spécifique)
    - Description (brève mais informative, mentionnant explicitement quel objectif est concerné si applicable)
    - Date et heure de début
    - Date et heure de fin
    - Participants (noms et rôles)
    - Emplacement (salle, virtuel ou lieu externe)
    
    Formater la réponse comme un objet JSON avec cette structure:
    {
      "events": [
        {
          "title": "Titre de l'événement",
          "description": "Description de l'événement",
          "startTime": "YYYY-MM-DDTHH:MM:SS",
          "endTime": "YYYY-MM-DDTHH:MM:SS",
          "participants": [{"name": "Nom", "role": "Rôle"}],
          "location": "Emplacement"
        },
        ...
      ]
    }
    
    Assure-toi que:
    1. Les horaires ne se chevauchent pas
    2. Les réunions ont des durées appropriées
    3. L'emploi du temps est optimal pour atteindre les 3 objectifs de l'utilisateur
    4. La distribution des tâches respecte les contraintes du calendrier (pas de réunions à des moments explicitement indiqués comme non disponibles)
    5. Toute période de travail sur un objectif est clairement étiquetée dans la description avec la référence à l'objectif
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en planification de calendrier. Ta mission est de générer un emploi du temps optimal qui permettra à l'utilisateur d'atteindre ses objectifs professionnels tout en respectant ses préférences et contraintes. Tes réponses doivent être intégralement en français.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Extract response
    const content = response.choices[0].message.content || "{}";
    const calendarData: CalendarResponse = JSON.parse(content);

    return NextResponse.json(calendarData);
  } catch (error) {
    console.error("Error generating calendar data:", error);
    return NextResponse.json(
      { error: "Échec de la génération du planning de calendrier" },
      { status: 500 }
    );
  }
}
