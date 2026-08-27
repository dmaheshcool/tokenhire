import { useNavigate } from "react-router-dom";

export function useLaunch() {
  const nav = useNavigate();
  return (target) => {
    if (target === "employer") nav("/app/hiring");
    else if (target === "candidate") nav("/app/join");
    else nav("/app");
  };
}
