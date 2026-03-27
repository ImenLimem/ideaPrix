package IdealPrix.service;

import IdealPrix.model.Article;
import IdealPrix.model.Fournisseur;
import IdealPrix.repository.ArticleRepository;
import IdealPrix.repository.FournisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FournisseurService {

    @Autowired
    private FournisseurRepository fournisseurRepository;
    @Autowired
    private ArticleRepository articleRepository; // injection pour vérifier les articles

    // Méthode pour ajouter un nouveau fournisseur
    public Fournisseur ajouterFournisseur(Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    // Méthode pour récupérer tous les fournisseurs
    public List<Fournisseur> getTousLesFournisseurs() {
        return fournisseurRepository.findAll();
    }

    // Méthode pour récupérer un fournisseur par son ID
    public Optional<Fournisseur> getFournisseurParId(Long id) {
        return fournisseurRepository.findById(id);
    }

    // Méthode pour modifier un fournisseur existant
    public Fournisseur modifierFournisseur(Fournisseur fournisseur) {
        if(fournisseurRepository.existsById(fournisseur.getId())) {
            return fournisseurRepository.save(fournisseur);
        } else {
            throw new RuntimeException("Fournisseur non trouvé");
        }
    }

    // Méthode pour supprimer un fournisseur
    /*public void supprimerFournisseur(Long id) {
        if(fournisseurRepository.existsById(id)) {
            fournisseurRepository.deleteById(id);
        } else {
            throw new RuntimeException("Fournisseur non trouvé"); // lance l'exception si absent
        }
    }*/
    // Vérifier si un fournisseur existe
    public boolean existsById(Long id) {
        return fournisseurRepository.existsById(id);
    }

    // Méthode pour supprimer un fournisseur
    public String supprimerFournisseur(Long id) {
        if (!fournisseurRepository.existsById(id)) {
            return "Fournisseur non trouvé";
        }

        // Vérifier s'il y a des articles liés
        long countArticles = articleRepository.countByFournisseurId(id);
        if (countArticles > 0) {
            return "Impossible de supprimer ce fournisseur, il est lié à " + countArticles + " article(s)";
        }

        // Aucun article lié, on peut supprimer
        fournisseurRepository.deleteById(id);
        return "Fournisseur supprimé avec succès";
    }

    // Méthode pour rechercher un fournisseur par son nom
    public List<Fournisseur> rechercherFournisseurParNom(String nom) {
        return fournisseurRepository.findAll().stream()
                .filter(f -> f.getNom().equalsIgnoreCase(nom))
                .toList();
    }

    // Méthode pour récupérer les articles d'un fournisseur
    public List<Article> getArticlesParFournisseur(Long fournisseurId) {
        if (!fournisseurRepository.existsById(fournisseurId)) {
            throw new RuntimeException("Fournisseur non trouvé");
        }
        return articleRepository.findByFournisseurId(fournisseurId);
    }
}