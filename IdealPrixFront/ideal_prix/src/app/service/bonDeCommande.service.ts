import { Article } from "@/models/Article";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BonDeCommandeService {
  private apiUrl = 'http://localhost:8080/bon-de-commande'; // Remplacez par l'URL de votre API
 private fournisseurUrl = 'http://localhost:8080/fournisseurs'; // Fournisseurs
  private articleUrl = 'http://localhost:8080/articles'; // Articles
;


  constructor(private http: HttpClient) {}

  // Ajouter un bon de commande
  ajouterBonDeCommande(bonDeCommandeRequest: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter`, bonDeCommandeRequest);
  }

  getAllBonDeCommandes(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/all`);
}

// bonDeCommande.service.ts
getBonDeCommandeDetails(id: number) {
  return this.http.get(`${this.apiUrl}/details/${id}`);
}


modifierBonDeCommande(id: number, bonDeCommandeRequest: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/modifier/${id}`, bonDeCommandeRequest);
}

archiverBonDeCommande(id: number): Observable<any> {
  return this.http.put(`${this.apiUrl}/archiver/${id}`, {});
}
downloadBonDeCommande(id: number) {
  return this.http.get(
    `${this.apiUrl}/${id}/download`,  // juste ça
    { responseType: 'blob' }
  );
}
 getAllFournisseurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.fournisseurUrl}/all`);
}

getArticles(category?: string) {
  let params = new HttpParams();
  if(category) params = params.set('category', category);
  return this.http.get<Article[]>('http://localhost:8080/articles', { params });
}
sendEmail(bonCommandeId: number): Observable<any> {
  return this.http.post(`/api/bon-de-commande/${bonCommandeId}/send-email`, {});
}


}