package IdealPrix.repository;

import IdealPrix.model.BonDeCommande;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface BonDeCommandeRepository extends JpaRepository<BonDeCommande, Long> {

    List<BonDeCommande> findAll();  // Récupérer tous les bons de commande
    Optional<BonDeCommande> findById(Long id);  // Récupérer un bon de commande par ID
}