package IdealPrix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Identifiant unique de l'article

    private String nom;          // Nom de l'article
    private String code;         // Code de l'article
    private double prixAchat;    // Prix d'achat de l'article
    private String image;        // Image de l'article
    private String famille;
    private double prixVente;    // Prix de vente de l'article

    @ManyToOne  // Relation Many-to-One avec Fournisseur
    @JoinColumn(name = "fournisseur_id")  // La colonne qui fait le lien avec le fournisseur
    @JsonManagedReference   // Pour éviter la récursion infinie lors de la sérialisation JSON
   // @JsonIgnoreProperties({"nom", "prenom", "pays", "adresse", "tel", "siteWeb", "email", "nomBanque", "adresseBanque", "brancheBanque", "paysBanque", "rib", "swiftCode", "articles"})  // Ignore l'objet fournisseur, mais garde l'ID
    @JsonIgnoreProperties({"articles"})
    private Fournisseur fournisseur;  // Le fournisseur auquel l'article appartient



    // Constructeur sans paramètre pour JPA
    public Article() {}

    // Constructeur avec paramètres
    public Article(String nom, String code, Fournisseur fournisseur, double prixAchat, String image, double prixVente) {
        this.nom = nom;
        this.code = code;
        this.fournisseur = fournisseur;
        this.prixAchat = prixAchat;
        this.image = image;
        this.famille = famille;
        this.prixVente = prixVente;

    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public double getPrixAchat() {
        return prixAchat;
    }

    public void setPrixAchat(double prixAchat) {
        this.prixAchat = prixAchat;
    }

    public String getImage() {
        return image;
    }
    public void setImage(String image) {
        this.image = image;
    }
    public void setFamille(String famille) {
        this.famille = famille;
    }

    public  String getFamille() {
        return famille;
    }



    public double getPrixVente() {
        return prixVente;
    }

    public void setPrixVente(double prixVente) {
        this.prixVente = prixVente;
    }

    public Fournisseur getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(Fournisseur fournisseur) {
        this.fournisseur = fournisseur;
    }
}