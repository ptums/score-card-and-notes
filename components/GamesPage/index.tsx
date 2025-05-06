import GamesList from "@/components/GamesPage/GamesList";
import NewCourseForm from "@/components/GamesPage/NewCourseForm";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";

import RangeForm from "./RangeForm";
import { useState } from "react";

export default function GamesRoute() {
  const [showForm, setShowForm] = useState("");

  if (showForm.includes(COURSE_OPTION)) return <NewCourseForm />;
  if (showForm.includes(RANGE_OPTION)) return <RangeForm />;

  return <GamesList setShowForm={setShowForm} />;
}
