import { useNavigate } from "react-router-dom";
import { Employer } from "./app/EmployerPage.jsx";
import { useStore } from "../context/Store.jsx";

export default function HiringPage() {
  const nav = useNavigate();
  const store = useStore();
  return <Employer store={store} back={() => nav("/")} />;
}
