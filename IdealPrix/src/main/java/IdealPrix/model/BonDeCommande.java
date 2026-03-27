package IdealPrix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
public class BonDeCommande {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numeroBonCommande;

    @ManyToOne
    private Fournisseur fournisseur;

    @OneToMany(mappedBy = "bonDeCommande", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<BonDeCommandeArticle> articles;



    private String description;

    @Enumerated(EnumType.STRING)  // Spécifie que c'est un enum qui sera stocké sous forme de String
    private StatutBonDeCommande statut;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd MMMM yyyy hh:mm:ss a", locale = "fr_FR")
    private LocalDateTime dateCommande;  // Date de la commande

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd MMMM yyyy hh:mm:ss a", locale = "fr_FR")
    private LocalDateTime dateExpedition; // Date d'expédition

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd MMMM yyyy hh:mm:ss a", locale = "fr_FR")
    private LocalDateTime dateLivraison;  // Date de livraison

    @Column(nullable = false)
    private Double totalTtc;



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

    public List<BonDeCommandeArticle> getArticles() {
        return articles;
    }

    public void setArticles(List<BonDeCommandeArticle> articles) {
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
    public Double getTotalTtc() {
        return totalTtc;
    }

    public void setTotalTtc(Double totalTtc) {
        this.totalTtc = totalTtc;
    }


}