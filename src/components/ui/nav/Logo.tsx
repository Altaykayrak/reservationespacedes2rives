import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center">
      <img
        src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Logolong.png"
        alt="L'espace des deux rives"
        className="h-12"
      />
    </Link>
  );
}