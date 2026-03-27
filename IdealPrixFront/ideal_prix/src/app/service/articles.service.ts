import { Article } from "@/models/Article";
import { Fournisseur } from "@/models/Fournisseurs";
import { Articles } from "@/pages/uikit/articles";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private apiUrl = 'http://localhost:8080/articles';  // URL de l'API Spring Boot

  constructor(private http: HttpClient) { }

   // Méthode pour récupérer les articles
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  // Méthode pour récupérer un article par ID
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }
// Méthode pour récupérer l'image d'un article
  
getImageUrl(imageName: string): string {
    if (!imageName) return ''; // pour éviter les erreurs
    return `http://localhost:8080/articles/images/${imageName}`;
}




  // Méthode pour récupérer tous les fournisseurs
  getFournisseurs(): Observable<Fournisseur[]> {
    return this.http.get<Fournisseur[]>(`${this.apiUrl}/fournisseurs`);
  }

  // Méthode pour ajouter un article (avec image)
addArticle(formData: FormData) {
  return this.http.post<Article>(
    'http://localhost:8080/articles',
    formData
  );
}



  
  // Méthode pour modifier un article (mettre à jour avec FormData)
 updateArticle(id: number, formData: FormData): Observable<Article> {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, formData);
  }


  // Méthode pour supprimer un article par ID
  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Rechercher des articles par nom, code ou famille
searchArticles(
  nom?: string,
  code?: string,
  famille?: string
): Observable<Article[]> {

  let params: any = {};

  if (nom) {
    params.nom = nom;
  }
  if (code) {
    params.code = code;
  }
  if (famille) {
    params.famille = famille;
  }

  return this.http.get<Article[]>(`${this.apiUrl}/search`, { params });
}

}