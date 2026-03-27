package IdealPrix.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
public class Archive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroBonCommande;

    @ManyToOne
    private Fournisseur fournisseur;

    @ManyToMany
    private List<Article> articles;

    private String description;
    private String statut;

    private LocalDateTime dateCommande;
    private LocalDateTime dateExpedition;
    private LocalDateTime dateLivraison;

    // Getters et Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroBonCommande() {
        return numeroBonCommande;
    }

    public void setNumeroBonCommande(String numeroBonCommande) {
        this.numeroBonCommande = numeroBonCommande;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }

    public List<Article> getArticles() {
        return articles;
    }

    public void setArticles(List<Article> articles) {
        this.articles = articles;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCommande() {
        return dateCommande;
    }

    public void setDateCommande(LocalDateTime dateCommande) {
        this.dateCommande = dateCommande;
    }

    public LocalDateTime getDateExpedition() {
        return dateExpedition;
    }

    public void setDateExpedition(LocalDateTime dateExpedition) {
        this.dateExpedition = dateExpedition;
    }

    public LocalDateTime getDateLivraison() {
        return dateLivraison;
    }

    public void setDateLivraison(LocalDateTime dateLivraison) {
        this.dateLivraison = dateLivraison;
    }
}