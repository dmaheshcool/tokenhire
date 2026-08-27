import { ClientsPanel } from "../app/EmployerPage.jsx";
import { useStore } from "../../context/Store.jsx";

export default function OrgSitesPage() {
  const { orgs, setOrgs, activeOrgId } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  return <ClientsPanel org={org} setOrgs={setOrgs} embedded />;
}
