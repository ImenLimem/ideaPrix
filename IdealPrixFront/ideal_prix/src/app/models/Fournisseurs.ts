import { Article } from "./Article";

export interface Fournisseur {
    id: number;           // Correspond à l'ID du fournisseur
    nom: string;
    prenom: string;
    pays: string;
    adresse: string;
    tel: string;
    siteWeb: string;
    email: string;
    nomBanque: string;
    adresseBanque: string;
    brancheBanque: string;
    paysBanque: string;
    rib: string;
    swiftCode: string;
    articles?: Article[]; // La liste des articles peut être vide, donc optionnelle
    
}