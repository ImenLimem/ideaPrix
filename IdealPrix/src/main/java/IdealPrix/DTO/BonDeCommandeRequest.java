package IdealPrix.DTO;

import IdealPrix.model.StatutBonDeCommande;

import java.util.Date;
import java.util.List;

public class BonDeCommandeRequest {
    private Long fournisseurId;
    private List<ArticleCommande> articles; // <-- remplacer List<Long> articleIds
    private String description;
    private StatutBonDeCommande statut;
    private Date dateExpedition;
    private Date dateLivraison;

    // Getters et setters
    public Long getFournisseurId() {
        return fournisseurId;
    }
    public void setFournisseurId(Long fournisseurId) {
        this.fournisseurId = fournisseurId;
    }

    public List<ArticleCommande> getArticles() {
        return articles;
    }

    public void setArticles(List<ArticleCommande> articles) {
        this.articles = articles;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public StatutBonDeCommande getStatut() {
        return statut;
    }
    public void setStatut(StatutBonDeCommande statut) {
        this.statut = statut;
    }

    public Date getDateExpedition() {
        return dateExpedition;
    }
    public void setDateExpedition(Date dateExpedition) {
        this.dateExpedition = dateExpedition;
    }

    public Date getDateLivraison() {
        return dateLivraison;
    }
    public void setDateLivraison(Date dateLivraison) {
        this.dateLivraison = dateLivraison;
    }
}
