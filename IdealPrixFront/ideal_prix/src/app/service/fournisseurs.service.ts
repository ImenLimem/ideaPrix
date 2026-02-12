import { Article } from "@/models/Article";
import { Fournisseur } from "@/models/Fournisseurs";
import { Fournisseurs } from "@/pages/uikit/fournisseurs";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
private baseUrl = 'http://localhost:8080/fournisseurs';

  constructor(private http: HttpClient) {}

  // Récupérer tous les fournisseurs
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.baseUrl}/all`);
  }

  // Récupérer un fournisseur par ID
  getFournisseurById(id: number): Observable<Fournisseur> {
    return this.http.get<Fournisseur>(`${this.baseUrl}/${id}`);
  }

  // Ajouter un fournisseur
  addFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(`${this.baseUrl}/ajouter`, fournisseur);
}


  // Modifier un fournisseur
  updateFournisseur(fournisseur: Fournisseur): Observable<Fournisseur> {
  // Pas besoin d'ajouter headers, Angular met automatiquement application/json
  return this.http.put<Fournisseur>('http://localhost:8080/fournisseurs/modifier', fournisseur);
}

getImageUrl(imagePath?: string | null): string {
  if (!imagePath) {
    return 'assets/no-image.png'; // optionnel
  }
  return `http://localhost:8080/articles/images/${imagePath}`;
}



  // Supprimer un fournisseur
  deleteFournisseur(id: number) {
  return this.http.delete(`${this.baseUrl}/supprimer/${id}`, { responseType: 'text' });
}
  // Rechercher un fournisseur par nom
searchFournisseur(keyword: string): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`http://localhost:8080/fournisseurs/search?keyword=${encodeURIComponent(keyword)}`);
}

// Récupérer les articles d'un fournisseur
getArticles(fournisseurId: number): Observable<Article[]> {
  return this.http.get<Article[]>(`${this.baseUrl}/${fournisseurId}/articles`);
}
}