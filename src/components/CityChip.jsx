import { Link, useLocation } from "react-router-dom";
import { MapPin } from "lucide-react";
import { STROKE } from "./ds.jsx";
import { cityFilterPath, citySlug } from "../lib/listing.js";

function cityIsActive(city, pathname, search) {
  const q = new URLSearchParams(search).get("city");
  if (q && q.toLowerCase() === String(city).toLowerCase()) return true;
  if (!pathname.startsWith("/walk-ins/")) return false;
  const slug = pathname.slice("/walk-ins/".length).split("/")[0];
  return slug && citySlug(city) === slug;
}

export function CityChip({ city }) {
  const { pathname, search } = useLocation();
  const on = cityIsActive(city, pathname, search);
  return (
    <Link
      to={cityFilterPath(city)}
      className={`city-chip${on ? " on" : ""}`}
      aria-current={on ? "page" : undefined}
    >
      <MapPin className="city-chip-pin" size={14} strokeWidth={STROKE} aria-hidden="true" />
      {city}
    </Link>
  );
}
