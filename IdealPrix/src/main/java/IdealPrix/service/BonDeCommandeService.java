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
            Date dateLivraison,
            Double totalTtc

            ) {

        Fournisseur fournisseur = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));

        BonDeCommande bon = new BonDeCommande();
        bon.setNumeroBonCommande(generateNumeroBonCommande());
        bon.setFournisseur(fournisseur);
        bon.setDescription(description);
        bon.setStatut(statut);
        bon.setDateCommande(LocalDateTime.now());
        bon.setTotalTtc(totalTtc);

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

        if (bon.getStatut() == StatutBonDeCommande.LIVRE
                || bon.getStatut() == StatutBonDeCommande.TERMINE) {
            throw new RuntimeException("Impossible de modifier ce bon de commande");
        }

        // 🔹 Mise à jour infos simples
        bon.setDescription(request.getDescription());
        bon.setStatut(request.getStatut());
        bon.setTotalTtc(request.getTotalTtc());

        Fournisseur fournisseur = fournisseurRepository.findById(request.getFournisseurId())
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
        bon.setFournisseur(fournisseur);

        if (request.getDateExpedition() != null)
            bon.setDateExpedition(request.getDateExpedition()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

        if (request.getDateLivraison() != null)
            bon.setDateLivraison(request.getDateLivraison()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());

        // 🔥 ÉTAPE 1 : supprimer TOUTES les anciennes lignes
        List<BonDeCommandeArticle> anciennesLignes =
                bonDeCommandeArticleRepository.findByBonDeCommande(bon);

        bonDeCommandeArticleRepository.deleteAll(anciennesLignes);

        // 🔥 ÉTAPE 2 : recréer uniquement celles envoyées
        List<BonDeCommandeArticle> nouvellesLignes = new ArrayList<>();

        for (ArticleCommande ac : request.getArticles()) {

            Article article = articleRepository.findById(ac.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article introuvable"));

            BonDeCommandeArticle ligne = new BonDeCommandeArticle();
            ligne.setBonDeCommande(bon);
            ligne.setArticle(article);
            ligne.setQuantite(ac.getQuantite());

            nouvellesLignes.add(ligne);
        }

        bonDeCommandeArticleRepository.saveAll(nouvellesLignes);

        bon.setArticles(nouvellesLignes);

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

    public BonDeCommande modifierBonDeCommandeComplet(Long id, BonDeCommandeRequest request) {
        BonDeCommande bon = bonDeCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        if (bon.getStatut() == StatutBonDeCommande.LIVRE || bon.getStatut() == StatutBonDeCommande.TERMINE) {
            throw new RuntimeException("Impossible de modifier ce bon de commande, il est déjà livré ou terminé");
        }

        // Mise à jour fournisseur et champs simples
        if (request.getFournisseurId() != null) {
            Fournisseur fournisseur = fournisseurRepository.findById(request.getFournisseurId())
                    .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
            bon.setFournisseur(fournisseur);
        }
        bon.setDescription(request.getDescription());
        bon.setStatut(request.getStatut());

        if (request.getDateExpedition() != null)
            bon.setDateExpedition(request.getDateExpedition().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());

        if (request.getDateLivraison() != null)
            bon.setDateLivraison(request.getDateLivraison().toInstant()
                    .atZone(ZoneId.systemDefault()).toLocalDateTime());

        // Supprimer explicitement les articlesSupprimes
        if (request.getArticlesSupprimes() != null) {
            for (Long articleId : request.getArticlesSupprimes()) {
                bonDeCommandeArticleRepository.findByBonDeCommande(bon).stream()
                        .filter(a -> a.getArticle().getId().equals(articleId))
                        .findFirst()
                        .ifPresent(a -> bonDeCommandeArticleRepository.delete(a));
            }
        }

        // Ajouter ou mettre à jour les articles envoyés
        for (ArticleCommande ac : request.getArticles()) {
            Optional<BonDeCommandeArticle> existing = bonDeCommandeArticleRepository.findByBonDeCommande(bon).stream()
                    .filter(a -> a.getArticle().getId().equals(ac.getArticleId()))
                    .findFirst();

            Article article = articleRepository.findById(ac.getArticleId())
                    .orElseThrow(() -> new RuntimeException("Article introuvable"));

            if (existing.isPresent()) {
                existing.get().setQuantite(ac.getQuantite());
                bonDeCommandeArticleRepository.save(existing.get());
            } else {
                BonDeCommandeArticle ligne = new BonDeCommandeArticle();
                ligne.setBonDeCommande(bon);
                ligne.setArticle(article);
                ligne.setQuantite(ac.getQuantite());
                bonDeCommandeArticleRepository.save(ligne);
            }
        }

        // Mettre à jour la liste complète
        bon.setArticles(bonDeCommandeArticleRepository.findByBonDeCommande(bon));

        return bonDeCommandeRepository.save(bon);
    }




}