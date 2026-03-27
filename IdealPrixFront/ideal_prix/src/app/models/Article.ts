import { Fournisseur } from "./Fournisseurs";

export interface Article {
  id: number;
  nom: string;
  code: string;
  prixAchat: number;
  famille: string;
  prixVente: number;
  image: string;
  //fournisseurId: number;  // Fournisseur avec son id et son nom, vous pouvez adapter selon votre besoin.
  fournisseurId?: number; // <-- important
  fournisseur?: Fournisseur; // pour affichage seulement
}
