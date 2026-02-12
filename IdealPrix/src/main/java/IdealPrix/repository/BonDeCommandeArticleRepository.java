package IdealPrix.repository;

import IdealPrix.model.BonDeCommande;
import IdealPrix.model.BonDeCommandeArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BonDeCommandeArticleRepository
        extends JpaRepository<BonDeCommandeArticle, Long> {
    // Méthode pour récupérer toutes les lignes d'un bon de commande
    List<BonDeCommandeArticle> findByBonDeCommande(BonDeCommande bonDeCommande);

    // Optionnel : pour supprimer toutes les lignes d'un bon de commande
    void deleteByBonDeCommande(BonDeCommande bonDeCommande);
}