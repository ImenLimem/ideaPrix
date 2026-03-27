package IdealPrix.repository;

import IdealPrix.model.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {
    @Query("SELECT f FROM Fournisseur f WHERE " +
            "LOWER(f.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.pays) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.tel) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(f.nomBanque) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Fournisseur> searchFournisseur(@Param("keyword") String keyword);
}