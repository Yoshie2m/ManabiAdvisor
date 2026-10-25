import { getApps, initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore/lite";

import { buddyCheers } from "../src/contexts/house-assignment/infrastructure/memory/buddyCheerSeedData";
import { characterCards } from "../src/contexts/mana-cultivation/infrastructure/memory/characterCardSeedData";
import {
  curricula,
  learningUnits,
  questions,
  upcomingExams,
} from "../src/contexts/mana-cultivation/infrastructure/memory/seedData";

// One-off script to populate Firestore's curricula/learningUnits/upcomingExams/
// questions collections, plus buddyCheers (house-assignment) and characterCards, from the demo content in infrastructure/memory/seedData.ts.
// Firestore's security rules deny client writes to these collections, so run
// this only while firestore.rules temporarily allows writes to them (see the
// TEMPORARY comment in firestore.rules), then revert and redeploy the rules.
//
// Usage: node --env-file=.env.local --import tsx scripts/seedFirestore.ts

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);
const firestore = getFirestore(app);

async function main() {
  for (const curriculum of curricula) {
    await setDoc(doc(firestore, "curricula", curriculum.id), {
      examType: curriculum.examType,
      subject: curriculum.subject,
      title: curriculum.title,
    });
  }

  for (const unit of learningUnits) {
    await setDoc(doc(firestore, "learningUnits", unit.id), {
      curriculumId: unit.curriculumId,
      title: unit.title,
      difficulty: unit.difficulty,
      questionType: unit.questionType,
      referenceText: unit.referenceText,
      referenceAudioUrl: unit.referenceAudioUrl,
    });
  }

  for (const exam of upcomingExams) {
    await setDoc(doc(firestore, "upcomingExams", exam.id), {
      title: exam.title,
      examType: exam.examType,
      scheduledDate: Timestamp.fromDate(exam.scheduledDate),
      targetLearningUnitIds: exam.targetLearningUnitIds,
    });
  }

  for (const question of questions) {
    await setDoc(doc(firestore, "questions", question.id), {
      learningUnitId: question.learningUnitId,
      prompt: question.prompt,
      answer: question.answer,
      explanation: question.explanation,
      imageUrl: question.imageUrl,
    });
  }

  for (const cheer of buddyCheers) {
    await setDoc(doc(firestore, "buddyCheers", cheer.id), {
      buddy: cheer.buddy,
      order: cheer.order,
      message: cheer.message,
    });
  }

  for (const card of characterCards) {
    await setDoc(doc(firestore, "characterCards", card.id), {
      number: card.number,
      name: card.name,
      furigana: card.furigana,
      title: card.title,
      flavor: card.flavor,
      rarity: card.rarity,
      attribute: card.attribute,
      imageUrl: card.imageUrl,
      costSubject: card.cost.subject,
      costCount: card.cost.count,
    });
  }

  console.log(
    `Seeded ${characterCards.length} character cards, ${buddyCheers.length} buddy cheers, ${curricula.length} curricula, ${learningUnits.length} learning units, ${upcomingExams.length} upcoming exams, ${questions.length} questions.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
