package IdealPrix.repository;

import IdealPrix.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    // Exemple de requête personnalisée pour inclure les informations du fournisseur
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.fournisseur")  // Utilisation de JOIN FETCH pour charger le fournisseur
    List<Article> findAllWithFournisseur();
    long countByFournisseurId(Long fournisseurId);
    // Récupérer tous les articles d'un fournisseur
    List<Article> findByFournisseurId(Long fournisseurId);
    List<Article> findByNomContainingIgnoreCase(String nom);
    List<Article> findByCodeContainingIgnoreCase(String code);
    List<Article> findByFamilleContainingIgnoreCase(String famille);
}