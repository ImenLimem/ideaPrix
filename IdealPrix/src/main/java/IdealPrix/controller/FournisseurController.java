package IdealPrix.controller;

import IdealPrix.model.Article;
import IdealPrix.model.Fournisseur;
import IdealPrix.repository.FournisseurRepository;
import IdealPrix.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/fournisseurs")
public class FournisseurController {

    @Autowired
    private FournisseurService fournisseurService;
    @Autowired
    private FournisseurRepository fournisseurRepository;

    @PostMapping("/ajouter")
    public ResponseEntity<Fournisseur> ajouterFournisseur(@RequestBody Fournisseur fournisseur) {

        System.out.println(">>> REQUÊTE REÇUE");
        System.out.println("Nom : " + fournisseur.getNom());

        Fournisseur saved = fournisseurService.ajouterFournisseur(fournisseur);

        System.out.println(">>> SAUVÉ AVEC ID : " + saved.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }





    // Endpoint pour récupérer tous les fournisseurs
    @GetMapping("/all")
    public List<Fournisseur> getTousLesFournisseurs() {
        return fournisseurService.getTousLesFournisseurs();
    }

    // Endpoint pour récupérer un fournisseur par son ID
    @GetMapping("/{id}")
    public Optional<Fournisseur> getFournisseurParId(@PathVariable Long id) {
        return fournisseurService.getFournisseurParId(id);
    }

    // Endpoint pour modifier un fournisseur
    @PutMapping("/modifier")
    public ResponseEntity<Fournisseur> updateFournisseur(@RequestBody Fournisseur fournisseur) {
        Fournisseur updated = fournisseurService.modifierFournisseur(fournisseur);
        return ResponseEntity.ok(updated);
    }


    // Endpoint pour supprimer un fournisseur

    @DeleteMapping("/supprimer/{id}")
    public ResponseEntity<String> supprimerFournisseur(@PathVariable Long id) {
        String message = fournisseurService.supprimerFournisseur(id);

        if (message.startsWith("Impossible")) {
            return new ResponseEntity<>(message, HttpStatus.CONFLICT); // 409 conflit
        } else if (message.equals("Fournisseur non trouvé")) {
            return new ResponseEntity<>(message, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(message, HttpStatus.OK);
        }
    }


    // Rechercher un fournisseur par son nom (préfixe "recherche")
    @GetMapping("/search")
    public ResponseEntity<List<Fournisseur>> searchFournisseur(@RequestParam String keyword) {
        List<Fournisseur> results = fournisseurRepository.searchFournisseur(keyword);
        return ResponseEntity.ok(results);
    }


    // Endpoint pour récupérer les articles d'un fournisseur
    @GetMapping("/{id}/articles")
    public ResponseEntity<?> getArticlesParFournisseur(@PathVariable Long id) {
        try {
            List<Article> articles = fournisseurService.getArticlesParFournisseur(id);
            if (articles.isEmpty()) {
                return ResponseEntity.ok("Aucun article pour ce fournisseur");
            }
            return ResponseEntity.ok(articles);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
