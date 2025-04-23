import GamesList from "@/components/GamePage/GamesList";
import { useRouter } from "next/router";
import { useState } from "react";

export default function GamesRoute() {
  const router = useRouter();
  const newPlayer = router.query.new_player as string;
  const [showForm, setShowForm] = useState(false);

  if (showForm || newPlayer === "1") {
    setShowForm(false);
    router.push("/new-game");
  }
  return <GamesList setShowForm={setShowForm} />;
}
