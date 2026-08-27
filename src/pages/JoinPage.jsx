import { useNavigate } from "react-router-dom";
import { Candidate } from "./app/CandidatePage.jsx";
import { useStore } from "../context/Store.jsx";

export default function JoinPage() {
  const nav = useNavigate();
  const store = useStore();
  return <Candidate store={store} back={() => nav("/")} />;
}
