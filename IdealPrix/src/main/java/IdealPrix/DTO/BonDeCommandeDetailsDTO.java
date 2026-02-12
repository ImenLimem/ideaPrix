package IdealPrix.DTO;

import IdealPrix.model.Article;
import IdealPrix.model.Fournisseur;
import IdealPrix.model.StatutBonDeCommande;

import java.time.LocalDateTime;
import java.util.List;

public class BonDeCommandeDetailsDTO {
    private Long id;
    private String numeroBonCommande;
    private Fournisseur fournisseur;   // détail complet
    private String description;
    private StatutBonDeCommande statut;
    private LocalDateTime dateCommande;
    private LocalDateTime dateLivraison;
    private LocalDateTime dateExpedition;

    private List<BonDeCommandeArticleDTO> articles; // liste des articles + quantité

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroBonCommande() { return numeroBonCommande; }
    public void setNumeroBonCommande(String numeroBonCommande) { this.numeroBonCommande = numeroBonCommande; }

    public Fournisseur getFournisseur() { return fournisseur; }
    public void setFournisseur(Fournisseur fournisseur) { this.fournisseur = fournisseur; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StatutBonDeCommande getStatut() { return statut; }
    public void setStatut(StatutBonDeCommande statut) { this.statut = statut; }

    public LocalDateTime getDateCommande() { return dateCommande; }
    public void setDateCommande(LocalDateTime dateCommande) { this.dateCommande = dateCommande; }

    public LocalDateTime getDateLivraison() { return dateLivraison; }
    public void setDateLivraison(LocalDateTime dateLivraison) { this.dateLivraison = dateLivraison; }

    public LocalDateTime getDateExpedition() { return dateExpedition; }
    public void setDateExpedition(LocalDateTime dateExpedition) { this.dateExpedition = dateExpedition; }

    public List<BonDeCommandeArticleDTO> getArticles() { return articles; }
    public void setArticles(List<BonDeCommandeArticleDTO> articles) { this.articles = articles; }

    // DTO interne pour article + quantité
    public static class BonDeCommandeArticleDTO {
        private Article article;
        private int quantite;

        public Article getArticle() { return article; }
        public void setArticle(Article article) { this.article = article; }

        public int getQuantite() { return quantite; }
        public void setQuantite(int quantite) { this.quantite = quantite; }
    }
}