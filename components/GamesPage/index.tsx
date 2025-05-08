import GamesList from "@/components/GamesPage/GamesList";
import NewCourseForm from "@/components/GamesPage/forms/NewCourseForm";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";

import { useState } from "react";
import NewRangeForm from "./forms/NewRangeForm";

export default function GamesRoute() {
  const [showForm, setShowForm] = useState("");

  if (showForm.includes(COURSE_OPTION)) return <NewCourseForm />;
  if (showForm.includes(RANGE_OPTION)) return <NewRangeForm />;

  return <GamesList setShowForm={setShowForm} />;
}
