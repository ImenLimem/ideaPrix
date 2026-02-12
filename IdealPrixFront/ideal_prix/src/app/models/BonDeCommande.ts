import { Article } from "./Article";

export interface BonDeCommandeArticle {
  id: number;
  article: {
    id: number;
    nom: string;
    code: string;
    prixAchat: number;
  };
  quantite: number; // ✅ la quantité
}

export interface BonDeCommande {
  id: number;
  numeroBonCommande: string;
  fournisseur: {
    nom: string;
    prenom: string;
  };
  statut: string;
  dateCommande?: string;
  dateLivraison?: string;
  dateExpedition?: string;
  articles?: BonDeCommandeArticle[];
}
export interface ArticleCommande {
  id: number;
  nom: string;
  quantite: number;

  isEditing?: boolean;
  oldQuantite?: number;
}
