import { useEffect } from "react";

// La page d'accueil renvoie vers l'audit, servi tel quel depuis public/audit/.
const Index = () => {
  useEffect(() => {
    window.location.replace("/audit/index.html");
  }, []);
  return null;
};

export default Index;
