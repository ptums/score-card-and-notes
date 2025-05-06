import CourseFlow from "@/components/GamePage/CourseFlow";
import RangeFlow from "@/components/GamePage/RangeFlow";
import { COURSE_OPTION, RANGE_OPTION } from "@/utils";
import { useRouter } from "next/router";

export default function GameOption() {
  const router = useRouter();
  const flow = router?.query?.flow;

  if (flow?.includes(RANGE_OPTION)) return <RangeFlow />;
  if (flow?.includes(COURSE_OPTION)) return <CourseFlow />;
}
