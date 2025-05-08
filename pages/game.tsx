import CourseFlow from "@/components/GamePage/CourseFlow";
import RangeFlow from "@/components/GamePage/RangeFlow";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";
import { useRouter } from "next/router";

export default function GameRoute() {
  const router = useRouter();
  const option = router.query.option as string;

  if (option?.includes(COURSE_OPTION)) {
    return <CourseFlow />;
  }

  if (option?.includes(RANGE_OPTION)) {
    return <RangeFlow />;
  }

  return null;
}
