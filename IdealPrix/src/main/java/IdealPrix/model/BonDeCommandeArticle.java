package IdealPrix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class BonDeCommandeArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    private BonDeCommande bonDeCommande;

    @ManyToOne
    private Article article;

    private int quantite;

    // getters & setters
    public Long getId() { return id; }

    public BonDeCommande getBonDeCommande() { return bonDeCommande; }
    public void setBonDeCommande(BonDeCommande bonDeCommande) {
        this.bonDeCommande = bonDeCommande;
    }

    public Article getArticle() { return article; }
    public void setArticle(Article article) {
        this.article = article;
    }

    public int getQuantite() { return quantite; }
    public void setQuantite(int quantite) {
        this.quantite = quantite;
    }
}
