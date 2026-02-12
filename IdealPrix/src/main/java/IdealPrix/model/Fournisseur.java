package IdealPrix.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.List;


@Entity
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    private String nom;
    private String prenom;
    private String pays;
    private String adresse;
    private String tel;
    private String siteWeb;
    private String email;
    private String nomBanque;
    private String adresseBanque;
    private String brancheBanque;
    private String paysBanque;
    private String rib;
    private String swiftCode;

    //@OneToMany(mappedBy = "fournisseur")  // Indique que la relation est gérée par l'attribut fournisseur dans Article
    //@JsonManagedReference // Pour éviter la récursion infinie dans la sérialisation JSON
    //private List<Article> articles;  // Liste des articles associés à ce fournisseur

    @JsonIgnore
    @OneToMany(mappedBy = "fournisseur")
    private List<Article> articles;

    // Getters et setters pour chaque attribut
    @JsonProperty("id")  // Utilisation de JsonProperty pour inclure explicitement l'ID
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @JsonProperty("nom")  // Utilisation de JsonProperty pour inclure explicitement le nom
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getSiteWeb() {
        return siteWeb;
    }

    public void setSiteWeb(String siteWeb) {
        this.siteWeb = siteWeb;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNomBanque() {
        return nomBanque;
    }

    public void setNomBanque(String nomBanque) {
        this.nomBanque = nomBanque;
    }

    public String getAdresseBanque() {
        return adresseBanque;
    }

    public void setAdresseBanque(String adresseBanque) {
        this.adresseBanque = adresseBanque;
    }

    public String getBrancheBanque() {
        return brancheBanque;
    }

    public void setBrancheBanque(String brancheBanque) {
        this.brancheBanque = brancheBanque;
    }

    public String getPaysBanque() {
        return paysBanque;
    }

    public void setPaysBanque(String paysBanque) {
        this.paysBanque = paysBanque;
    }

    public String getRib() {
        return rib;
    }

    public void setRib(String rib) {
        this.rib = rib;
    }

    public String getSwiftCode() {
        return swiftCode;
    }

    public void setSwiftCode(String swiftCode) {
        this.swiftCode = swiftCode;
    }

    public List<Article> getArticles() {
        return articles;
    }

    public void setArticles(List<Article> articles) {
        this.articles = articles;
    }
}