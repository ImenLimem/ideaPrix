package IdealPrix.service;

import IdealPrix.DTO.ArticleCommande;
import IdealPrix.DTO.BonDeCommandeDetailsDTO;
import IdealPrix.DTO.BonDeCommandeRequest;
import IdealPrix.model.*;
import IdealPrix.repository.ArticleRepository;
import IdealPrix.repository.BonDeCommandeArticleRepository;
import IdealPrix.repository.BonDeCommandeRepository;
import IdealPrix.repository.FournisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BonDeCommandeService {

    @Autowired
    private BonDeCommandeRepository bonDeCommandeRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Autowired
    private BonDeCommandeArticleRepository bonDeCommandeArticleRepository;

    // Méthode pour générer un numéro de bon de commande aléatoire (8 chiffres)
    private String generateNumeroBonCommande() {
        // Génère un numéro aléatoire à 8 chiffres
        return String.format("%08d", (int)(Math.random() * 100000000));
    }

    // Méthode pour créer un bon de commande
    public BonDeCommande ajouterBonDeCommande(
            Long fournisseurId,
            List<ArticleCommande> articlesRequest,
            String description,
            StatutBonDeCommande statut,
            Date dateExpedition,
            Date dateLivraison
    ) {

        Fournisseur fournisseur = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));

        BonDeCommande bon = new BonDeCommande();
        bon.setNumeroBonCommande(generateNumeroBonCommande());
        bon.setFournisseur(fournisseur);
        bon.setDescription(description);
        bon.setStatut(statut);
        bon.setDateCommande(LocalDateTime.now());

        // ✅ Ajouter conversion des dates
        if (dateExpedition != null) {
            bon.setDateExpedition(dateExpedition.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        }

        if (dateLivraison != null) {
            bon.setDateLivraison(dateLivraison.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        }

        bon = bonDeCommandeRepository.save(bon);

        List<BonDeCommandeArticle> lignes = new ArrayList<>();

        for (ArticleCommande ac : articlesRequest) {
            Article article = articleRepository.findById(ac.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article introuvable"));

            BonDeCommandeArticle ligne = new BonDeCommandeArticle();
            ligne.setBonDeCommande(bon);
            ligne.setArticle(article);
            ligne.setQuantite(ac.getQuantite());

            lignes.add(ligne);
        }

        bonDeCommandeArticleRepository.saveAll(lignes);
        bon.setArticles(lignes);

        return bon;
    }


    // Récupérer tous les bons de commande
    public List<BonDeCommande> getAllBonDeCommandes() {
        return bonDeCommandeRepository.findAll();
    }

    // Récupérer un bon de commande par ID
    public Optional<BonDeCommande> getBonDeCommandeById(Long id) {
        return bonDeCommandeRepository.findById(id);
    }

    // Modifier un bon de commande
    public BonDeCommande modifierBonDeCommande(Long id, BonDeCommandeRequest request) {
        BonDeCommande bon = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        if (bon.getStatut() == StatutBonDeCommande.LIVRE || bon.getStatut() == StatutBonDeCommande.TERMINE) {
            throw new RuntimeException("Impossible de modifier ce bon de commande, il est déjà livré ou terminé");
        }

        // Mise à jour des champs de base
        bon.setDescription(request.getDescription());
        bon.setStatut(request.getStatut());

        // Mettre à jour le fournisseur
        Fournisseur fournisseur = fournisseurRepository.findById(request.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
        bon.setFournisseur(fournisseur);

        // Mettre à jour les dates
        if (request.getDateExpedition() != null)
            bon.setDateExpedition(request.getDateExpedition().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());
        if (request.getDateLivraison() != null)
            bon.setDateLivraison(request.getDateLivraison().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());

        // Gérer les articles
        List<BonDeCommandeArticle> existingArticles = bonDeCommandeArticleRepository.findByBonDeCommande(bon);

        // Supprimer les articles qui ne sont pas dans la liste envoyée
        List<Long> sentArticleIds = request.getArticles().stream().map(ArticleCommande::getArticleId).toList();
        existingArticles.stream()
                .filter(a -> !sentArticleIds.contains(a.getArticle().getId()))
                .forEach(a -> bonDeCommandeArticleRepository.delete(a));

        // Ajouter ou mettre à jour les articles envoyés
        for (ArticleCommande ac : request.getArticles()) {
            Optional<BonDeCommandeArticle> existing = existingArticles.stream()
                    .filter(e -> e.getArticle().getId().equals(ac.getArticleId()))
                    .findFirst();

            Article article = articleRepository.findById(ac.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article introuvable"));

            if (existing.isPresent()) {
                existing.get().setQuantite(ac.getQuantite());
                bonDeCommandeArticleRepository.save(existing.get());
            } else {
                BonDeCommandeArticle newLine = new BonDeCommandeArticle();
                newLine.setBonDeCommande(bon);
                newLine.setArticle(article);
                newLine.setQuantite(ac.getQuantite());
                bonDeCommandeArticleRepository.save(newLine);
            }
        }

        return bonDeCommandeRepository.save(bon);
    }



    // Archiver un bon de commande
    public BonDeCommande archiverBonDeCommande(Long id) {
        BonDeCommande bon = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        // Mettre le statut à ARCHIVE
        bon.setStatut(StatutBonDeCommande.ARCHIVE);

        // Sauvegarder le changement
        return bonDeCommandeRepository.save(bon);
    }

    public File generateBonDeCommandePdf(Long id) throws Exception {

        // 1️⃣ Récupérer le bon de commande
        BonDeCommande bc = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        // 2️⃣ Charger le template HTML (UTF-8)
        String template = new String(
                getClass().getResourceAsStream("/templates/bon-de-commande.html").readAllBytes(),
                StandardCharsets.UTF_8
        );

        // 3️⃣ Construire le tableau des articles + calcul du total
        double totalPrix = 0;
        StringBuilder articlesHtml = new StringBuilder();

        for (BonDeCommandeArticle ligne : bc.getArticles()) {

            Article article = ligne.getArticle();
            int quantite = ligne.getQuantite();

            double prixUnitaire = article.getPrixAchat();
            double totalLigne = prixUnitaire * quantite;
            totalPrix += totalLigne;

            articlesHtml.append("<tr>")
                    .append("<td>").append(article.getCode()).append("</td>")
                    .append("<td>").append(article.getNom()).append("</td>")
                    .append("<td>").append(quantite).append("</td>")
                    .append("<td>").append(String.format("%.2f", prixUnitaire)).append("</td>")
                    .append("<td>").append(String.format("%.2f", totalLigne)).append("</td>")
                    .append("</tr>");
        }

        // 4️⃣ Remplacer les variables dans le template
        template = template
                // Société
                .replace("{{societeNom}}", "Hosni Ayed Holding")
                .replace("{{societeAdresse}}", "Avenue Habib Bourguiba Kisbet el Madiouni")
                .replace("{{societeEmail}}", "")
                .replace("{{societeTel}}", "")
                .replace("{{societeTVA}}", "1810075L/A/M/000")

                // Bon de commande
                .replace("{{numero}}", bc.getNumeroBonCommande())
                .replace("{{statut}}", bc.getStatut().name())
                .replace("{{dateCommande}}",
                        bc.getDateCommande().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))

                // Fournisseur
                .replace("{{fournisseurNom}}", bc.getFournisseur().getNom())
                .replace("{{fournisseurPrenom}}", bc.getFournisseur().getPrenom())
                .replace("{{fournisseurEmail}}",
                        bc.getFournisseur().getEmail() != null ? bc.getFournisseur().getEmail() : "")
                .replace("{{fournisseurTel}}",
                        bc.getFournisseur().getTel() != null ? bc.getFournisseur().getTel() : "")
                .replace("{{fournisseurAdresse}}",
                        bc.getFournisseur().getAdresse() != null ? bc.getFournisseur().getAdresse() : "")

                // Articles
                .replace("{{articles}}", articlesHtml.toString())
                .replace("{{totalPrix}}", String.format("%.2f", totalPrix));

        // 5️⃣ Générer le PDF
        return pdfGeneratorService.generatePdfFromHtml(
                template,
                "BonCommande_" + bc.getNumeroBonCommande()
        );
    }
    public BonDeCommandeDetailsDTO getBonDeCommandeDetails(Long id) {
        BonDeCommande bon = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        BonDeCommandeDetailsDTO dto = new BonDeCommandeDetailsDTO();
        dto.setId(bon.getId());
        dto.setNumeroBonCommande(bon.getNumeroBonCommande());
        dto.setFournisseur(bon.getFournisseur());
        dto.setDescription(bon.getDescription());
        dto.setStatut(bon.getStatut());
        dto.setDateCommande(bon.getDateCommande());
        dto.setDateLivraison(bon.getDateLivraison());
        dto.setDateExpedition(bon.getDateExpedition());

        List<BonDeCommandeDetailsDTO.BonDeCommandeArticleDTO> articlesDto = new ArrayList<>();
        if (bon.getArticles() != null) {
            for (var ligne : bon.getArticles()) {
                BonDeCommandeDetailsDTO.BonDeCommandeArticleDTO ligneDto = new BonDeCommandeDetailsDTO.BonDeCommandeArticleDTO();
                ligneDto.setArticle(ligne.getArticle());
                ligneDto.setQuantite(ligne.getQuantite());
                articlesDto.add(ligneDto);
            }
        }
        dto.setArticles(articlesDto);

        return dto;
    }

    public BonDeCommande modifierBonDeCommandeComplet(Long id, BonDeCommandeRequest bonDeCommandeRequest) {
        BonDeCommande bonDeCommande = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        // Interdire modification si déjà LIVRE ou TERMINE
        if (bonDeCommande.getStatut() == StatutBonDeCommande.LIVRE ||
                bonDeCommande.getStatut() == StatutBonDeCommande.TERMINE) {
            throw new RuntimeException("Impossible de modifier ce bon de commande, il est déjà livré ou terminé");
        }

        // Mise à jour du fournisseur si fourni
        if (bonDeCommandeRequest.getFournisseurId() != null) {
            Fournisseur fournisseur = fournisseurRepository.findById(bonDeCommandeRequest.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
            bonDeCommande.setFournisseur(fournisseur);
        }

        // Mise à jour des champs simples
        bonDeCommande.setDescription(bonDeCommandeRequest.getDescription());
        bonDeCommande.setStatut(bonDeCommandeRequest.getStatut());

        if (bonDeCommandeRequest.getDateExpedition() != null) {
            bonDeCommande.setDateExpedition(bonDeCommandeRequest.getDateExpedition().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        }

        if (bonDeCommandeRequest.getDateLivraison() != null) {
            bonDeCommande.setDateLivraison(bonDeCommandeRequest.getDateLivraison().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime());
        }

        // Mise à jour des articles et quantités
        if (bonDeCommandeRequest.getArticles() != null && !bonDeCommandeRequest.getArticles().isEmpty()) {
            // Supprimer les anciens articles liés à ce bon
            bonDeCommandeArticleRepository.deleteAll(bonDeCommande.getArticles());

            // Ajouter les nouveaux articles
            List<BonDeCommandeArticle> nouvellesLignes = new ArrayList<>();
            for (ArticleCommande ac : bonDeCommandeRequest.getArticles()) {
                Article article = articleRepository.findById(ac.getArticleId())
                        .orElseThrow(() -> new RuntimeException("Article introuvable"));

                BonDeCommandeArticle ligne = new BonDeCommandeArticle();
                ligne.setBonDeCommande(bonDeCommande);
                ligne.setArticle(article);
                ligne.setQuantite(ac.getQuantite());

                nouvellesLignes.add(ligne);
            }

            bonDeCommandeArticleRepository.saveAll(nouvellesLignes);
            bonDeCommande.setArticles(nouvellesLignes);
        }

        return bonDeCommandeRepository.save(bonDeCommande);
    }

}