// app/api/mock-context/route.ts
import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { MockContext } from "@/types";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    // Build prompt for OpenAI
    const prompt = `
    Génère un contexte professionnel réaliste pour une application de planification de calendrier.
    
    Crée un contexte professionnel aléatoire et TRÈS DIVERSIFIÉ - cela peut être un cabinet d'avocats, un hôpital, 
    une équipe sportive, une école, une entreprise artisanale, une agence gouvernementale, un restaurant, une entreprise agricole 
    ou tout autre cadre professionnel. Sois créatif et spécifique, en évitant les contextes trop typiques de startups tech.
    
    Pour ce contexte, fournis:
    
    1. Le type d'entreprise/organisation
    2. Le nom de l'entreprise/organisation (fictif mais réaliste)
    3. Une liste de 5-7 collègues avec:
       - Nom (des noms français)
       - Titre de poste spécifique au lieu de travail choisi
    4. Un utilisateur actuel (moi) avec:
       - Nom (un nom français)
       - Titre de poste
       - 3 objectifs professionnels spécifiques à atteindre prochainement
    5. Un ensemble de 10-15 réunions comprenant:
       - Titre (spécifique au lieu de travail)
       - Description
       - Heure de début et de fin (dans les 7 prochains jours)
       - Si la réunion est flexible/peut être reprogrammée
       - Liste des participants (parmi les collègues et l'utilisateur actuel)
       - À quel objectif la réunion est liée (pour les réunions de l'utilisateur actuel)
       - Lieu (nom de salle, virtuel ou lieu externe)
    
    IMPORTANT: Assure-toi que TOUT le contenu textuel soit en français. Les noms, titres, descriptions, tout doit être en français.
    
    Retourne les données sous forme d'objet JSON avec cette structure:
    {
      "companyType": "Type d'entreprise/organisation",
      "companyName": "Nom de l'entreprise/organisation",
      "colleagues": [
        {
          "id": "unique-id-1",
          "name": "Nom du collègue",
          "job": "Titre du poste",
          "meetings": ["meeting-id-1", "meeting-id-2"]
        },
        ...
      ],
      "currentUser": {
        "id": "user-id",
        "name": "Nom de l'utilisateur",
        "job": "Titre du poste de l'utilisateur",
        "meetings": ["meeting-id-1", "meeting-id-3", ...],
        "objectives": ["Objectif 1", "Objectif 2", "Objectif 3"]
      },
      "meetings": [
        {
          "id": "meeting-id-1",
          "title": "Titre de la réunion",
          "description": "Description de la réunion",
          "startTime": "YYYY-MM-DDTHH:MM:SS",
          "endTime": "YYYY-MM-DDTHH:MM:SS",
          "isFlexible": true/false,
          "participants": ["user-id", "colleague-id-1", ...],
          "objective": "Objectif associé ou chaîne vide",
          "location": "Lieu de la réunion"
        },
        ...
      ]
    }
    
    Sois créatif avec le contexte, mais assure-toi qu'il soit réaliste et que les réunions reflètent le type de lieu de travail sélectionné. Utilise différents types d'organisation: juridique, éducation, agriculture, sports, artisanat, service public, santé, etc.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert en dynamique de travail et en gestion de calendrier. Génère un contexte professionnel réaliste pour une application de planification de calendrier. Toutes tes réponses doivent être en français.",
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
    const contextData: MockContext = JSON.parse(content);

    return NextResponse.json(contextData);
  } catch (error) {
    console.error("Error generating mock context:", error);
    return NextResponse.json(
      { error: "Échec de la génération du contexte professionnel" },
      { status: 500 }
    );
  }
}
