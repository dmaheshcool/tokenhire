import { TeamPanel } from "../app/EmployerPage.jsx";
import { useStore } from "../../context/Store.jsx";

export default function OrgTeamPage() {
  const { orgs, setOrgs, activeOrgId } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  return <TeamPanel org={org} setOrgs={setOrgs} embedded />;
}
