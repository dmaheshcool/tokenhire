import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Employer } from "./app/EmployerPage.jsx";
import { useStore } from "../context/Store.jsx";

export default function HiringPage() {
  const nav = useNavigate();
  const store = useStore();
  const { driveId } = useParams();
  if (!store.activeOrgId) return <Navigate to="/login" replace />;
  return <Employer store={store} back={() => nav("/")} initialDriveId={driveId} />;
}
