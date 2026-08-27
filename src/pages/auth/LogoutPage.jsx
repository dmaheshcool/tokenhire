import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useStore } from "../../context/Store.jsx";

export default function LogoutPage() {
  const { signOut } = useStore();
  const [done, setDone] = useState(false);
  useEffect(() => {
    signOut().finally(() => setDone(true));
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!done) return null;
  return <Navigate to="/login" replace />;
}
