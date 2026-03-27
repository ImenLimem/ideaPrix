package IdealPrix.controller;

import IdealPrix.DTO.BonDeCommandeDetailsDTO;
import IdealPrix.DTO.BonDeCommandeRequest;
import IdealPrix.model.BonDeCommande;
import IdealPrix.repository.BonDeCommandeRepository;
import IdealPrix.service.BonDeCommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/bon-de-commande")
public class BonDeCommandeController {

    @Autowired
    private BonDeCommandeService bonDeCommandeService;

    @Autowired
    private BonDeCommandeRepository bonDeCommandeRepository;

    // Ajouter un nouveau bon de commande
    @PostMapping("/ajouter")
    public BonDeCommande ajouterBonDeCommande(@RequestBody BonDeCommandeRequest bonDeCommandeRequest) {
        // Appel du service avec les données du corps de la requête
        return bonDeCommandeService.ajouterBonDeCommande(
                bonDeCommandeRequest.getFournisseurId(),
                bonDeCommandeRequest.getArticles(), // <-- corrigé ici
                bonDeCommandeRequest.getDescription(),
                bonDeCommandeRequest.getStatut(),
                bonDeCommandeRequest.getDateExpedition(),
                bonDeCommandeRequest.getDateLivraison(),
                bonDeCommandeRequest.getTotalTtc()
        );
    }


    // Récupérer tous les bons de commande
    @GetMapping("/all")
    public List<BonDeCommande> getAllBonDeCommandes() {
        return bonDeCommandeService.getAllBonDeCommandes();
    }

    // Récupérer un bon de commande par ID
    @GetMapping("/details/{id}")
    public BonDeCommandeDetailsDTO getBonDeCommandeDetails(@PathVariable Long id) {
        return bonDeCommandeService.getBonDeCommandeDetails(id);
    }


    // Modifier un bon de commande
    @PutMapping("/modifier/{id}")
    public BonDeCommande modifierBonDeCommande(@PathVariable Long id, @RequestBody BonDeCommandeRequest bonDeCommandeRequest) {
        return bonDeCommandeService.modifierBonDeCommande(id, bonDeCommandeRequest);
    }

    // Archiver un bon de commande
    @PutMapping("/archiver/{id}")
    public BonDeCommande archiverBonDeCommande(@PathVariable Long id) {
        return bonDeCommandeService.archiverBonDeCommande(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadBonDeCommande(@PathVariable Long id) throws Exception {

        File pdf = bonDeCommandeService.generateBonDeCommandePdf(id);
        byte[] content = Files.readAllBytes(pdf.toPath());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=" + pdf.getName())
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }

    @PutMapping("/modifier-complet/{id}")
    public BonDeCommande modifierBonDeCommandeComplet(
            @PathVariable Long id,
            @RequestBody BonDeCommandeRequest bonDeCommandeRequest) {
        return bonDeCommandeService.modifierBonDeCommandeComplet(id, bonDeCommandeRequest);
    }



}