import GamesList from "@/components/GamesPage/GamesList";
import NewCourseForm from "@/components/GamesPage/NewCourseForm";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RangeForm from "./RangeForm";

export default function GamesRoute() {
  const router = useRouter();
  const newPlayer = router.query.new_player as string;
  const option = router.query.option as string;
  console.log({
    router: router.asPath,
    newPlayer,
    option,
  });

  // http://localhost:3001/games?new_player=1&option=range
  const [showForm, setShowForm] = useState("");

  useEffect(() => {
    if (option) {
      if (option.includes(RANGE_OPTION)) {
        setShowForm(RANGE_OPTION);
      }
      if (option.includes(COURSE_OPTION)) {
        setShowForm(COURSE_OPTION);
      }
    }
  }, [option]);

  if (newPlayer.includes("1")) {
    if (showForm.includes(COURSE_OPTION)) return <NewCourseForm />;
    if (showForm.includes(RANGE_OPTION)) return <RangeForm />;
  }

  return <GamesList setShowForm={setShowForm} />;
}
