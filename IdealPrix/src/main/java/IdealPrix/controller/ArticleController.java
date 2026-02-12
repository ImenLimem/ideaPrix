package IdealPrix.controller;

import IdealPrix.model.Article;
import IdealPrix.model.Fournisseur;
import IdealPrix.repository.ArticleRepository;
import IdealPrix.repository.FournisseurRepository;
import IdealPrix.service.ArticleService;
import IdealPrix.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/articles")
@CrossOrigin(origins = "http://localhost:4200")
public class ArticleController {

    @Autowired
    private ArticleService articleService;
    @Autowired
    private FournisseurRepository fournisseurRepository;
    @Autowired
    private ArticleRepository articleRepository;

    private static final String UPLOAD_DIR = "C:/images/articles";

    @Autowired
    private FournisseurService fournisseurService; // Service Fournisseur pour récupérer la liste des fournisseurs
    // Répertoire de destination pour les images uploadées


    // Ajouter un article
   /* @PostMapping
    public ResponseEntity<Article> ajouterArticle(@RequestBody Article article) {
        Article nouvelArticle = articleService.ajouterArticle(article);
        return new ResponseEntity<>(nouvelArticle, HttpStatus.CREATED);
    }*/

    // Ajouter un article avec une image
    /*@PostMapping
    public ResponseEntity<Article> ajouterArticle(
            @RequestParam("nom") String nom,
            @RequestParam("code") String code,
            @RequestParam("prixAchat") double prixAchat,
            @RequestParam("prixVente") double prixVente,
            @RequestParam("famille") String famille,
            @RequestParam("fournisseurId") Long fournisseurId,
            @RequestParam("image") MultipartFile image) {

        try {
            // Vérifier si l'image est vide
            if (image.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);  // Fichier image manquant
            }

            // Sauvegarder l'image et récupérer son nom
            String imageName = saveImage(image);

            // Récupérer le fournisseur par son ID
            Optional<Fournisseur> fournisseurOptional = fournisseurService.getFournisseurParId(fournisseurId);

            // Vérifier si le fournisseur est présent
            if (!fournisseurOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  // Fournisseur non trouvé
            }

            Fournisseur fournisseur = fournisseurOptional.get();  // Extraire le fournisseur réel

            // Créer l'article avec les données reçues et le fournisseur récupéré
            Article article = new Article(nom, code, fournisseur, prixAchat, imageName, prixVente);
            article.setFamille(famille);  // On définit la famille de l'article

            // Sauvegarder l'article dans la base de données
            Article nouvelArticle = articleService.ajouterArticle(article);

            return new ResponseEntity<>(nouvelArticle, HttpStatus.CREATED);  // Article créé avec succès
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);  // Erreur lors de l'upload de l'image
        }
    }*/
    /*@PostMapping
    public ResponseEntity<Article> ajouterArticle(
            @RequestParam("nom") String nom,
            @RequestParam("code") String code,
            @RequestParam("prixAchat") double prixAchat,
            @RequestParam("prixVente") double prixVente,
            @RequestParam("famille") String famille,
            @RequestParam("fournisseurId") Long fournisseurId,
            @RequestParam("image") MultipartFile image) {

        try {
            if (image.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);  // Fichier image manquant
            }

            // Sauvegarder l'image
            String imageName = saveImage(image);

            // Récupérer le fournisseur par ID
            Optional<Fournisseur> fournisseurOptional = fournisseurService.getFournisseurParId(fournisseurId);
            if (!fournisseurOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);  // Fournisseur non trouvé
            }

            Fournisseur fournisseur = fournisseurOptional.get();

            // Créer l'article
            Article article = new Article(nom, code, fournisseur, prixAchat, imageName, prixVente);
            article.setFamille(famille);

            // Sauvegarder l'article dans la base de données
            Article nouvelArticle = articleService.ajouterArticle(article);

            // Retourner l'article complet avec le fournisseur
            return new ResponseEntity<>(nouvelArticle, HttpStatus.CREATED);
        } catch (IOException e) {
            System.err.println("Erreur lors du traitement de l'image : " + e.getMessage());  // Afficher l'erreur dans les logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        } catch (Exception e) {
            System.err.println("Erreur inattendue : " + e.getMessage());  // Afficher l'erreur inattendue dans les logs
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }*/
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Article> addArticle(
            @RequestParam String nom,
            @RequestParam String code,
            @RequestParam Double prixAchat,
            @RequestParam Double prixVente,
            @RequestParam String famille,
            @RequestParam Long fournisseurId,
            @RequestParam MultipartFile image
    ) throws IOException {

        // Vérifier le fournisseur
        Fournisseur fournisseur = fournisseurRepository.findById(fournisseurId)
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));

        Article article = new Article();
        article.setNom(nom);
        article.setCode(code);
        article.setPrixAchat(prixAchat);
        article.setPrixVente(prixVente);
        article.setFamille(famille);
        article.setFournisseur(fournisseur);

        // Sauvegarder l'image avec UUID
        String imageName = saveImage(image); // utilise ta méthode saveImage qui ajoute UUID
        article.setImage(imageName);        // stocke le nom avec UUID

        Article saved = articleRepository.save(article);
        return ResponseEntity.ok(saved);
    }




    // Méthode pour sauvegarder l'image sur le serveur
    /*private String saveImage(MultipartFile image) throws IOException {
        // Obtenir le nom du fichier
        String imageName = image.getOriginalFilename();

        // Vérifier si le fichier est valide
        if (imageName == null || imageName.isEmpty()) {
            throw new IOException("Le nom du fichier est invalide.");
        }

        // Créer le chemin complet où l'image sera sauvegardée
        String filePath = UPLOAD_DIR + "/" + imageName;

        // Créer le répertoire si nécessaire
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();  // Crée le répertoire si il n'existe pas
        }

        // Sauvegarder l'image dans le répertoire spécifié
        File file = new File(filePath);
        image.transferTo(file);  // Sauvegarde l'image sur le disque

        return imageName;  // Retourner le nom du fichier
    }*/
    /*private String saveImage(MultipartFile image) throws IOException {
        // Obtenir le nom du fichier
        String imageName = image.getOriginalFilename();

        // Assurez-vous que le nom du fichier est valide
        if (imageName == null || imageName.isEmpty()) {
            throw new IOException("Le nom du fichier est invalide.");
        }

        // Définir le chemin pour enregistrer l'image
        String filePath = UPLOAD_DIR + "/" + imageName;
        File directory = new File(UPLOAD_DIR);

        if (!directory.exists()) {
            directory.mkdirs();  // Crée le répertoire si nécessaire
        }

        // Sauvegarder le fichier
        File file = new File(filePath);
        image.transferTo(file);

        return imageName;  // Retourner le nom du fichier sauvegardé
    }
*/
    // Méthode pour sauvegarder l'image avec UUID_nomfichier.jpg
    private String saveImage(MultipartFile file) throws IOException {
        String uploadDir = UPLOAD_DIR;



        Files.createDirectories(Paths.get(uploadDir));

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isEmpty()) {
            throw new IOException("Nom de fichier invalide");
        }

        // Remplacer les caractères spéciaux et ajouter UUID
        String imageName = UUID.randomUUID() + "_" + originalName.replaceAll("[^a-zA-Z0-9.]", "_");

        Path path = Paths.get(uploadDir, imageName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        return imageName; // retourne UUID_nomfichier.jpg
    }


    @GetMapping("/images/{imageName}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(imageName);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }



    // Supprimer un article
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerArticle(@PathVariable Long id) {
        articleService.supprimerArticle(id);
        return ResponseEntity.noContent().build();
    }

    // Modifier un article
    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam("code") String code,
            @RequestParam("prixAchat") double prixAchat,
            @RequestParam("prixVente") double prixVente,
            @RequestParam("famille") String famille,
            @RequestParam("fournisseurId") Long fournisseurId,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Récupérer l'article existant
            Optional<Article> articleOpt = articleService.afficherDetails(id);
            if (!articleOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Article article = articleOpt.get();

            // Mettre à jour les champs simples
            article.setNom(nom);
            article.setCode(code);
            article.setPrixAchat(prixAchat);
            article.setPrixVente(prixVente);
            article.setFamille(famille);

            // Mettre à jour le fournisseur si fourni
            Optional<Fournisseur> fournisseurOpt = fournisseurService.getFournisseurParId(fournisseurId);
            fournisseurOpt.ifPresent(article::setFournisseur);

            // Mettre à jour l'image si une nouvelle est envoyée
            if (image != null && !image.isEmpty()) {
                // Générer nom avec UUID
                String imageName = saveImage(image);
                article.setImage(imageName);
            }

            // Sauvegarder l'article mis à jour
            Article updatedArticle = articleService.modifierArticle(id, article);

            return ResponseEntity.ok(updatedArticle);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    // Afficher les détails d'un article
    @GetMapping("/{id}")
    public ResponseEntity<Article> afficherDetails(@PathVariable Long id) {
        Optional<Article> article = articleService.afficherDetails(id);
        if (article.isPresent()) {
            return ResponseEntity.ok(article.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Lister tous les articles
    @GetMapping
    public List<Article> listerArticles() {
        // Cette méthode renvoie les articles avec les informations du fournisseur
        return articleService.listerArticles();
    }
    // Lister tous les fournisseurs (pour afficher lors de l'ajout d'un article)
    @GetMapping("/fournisseurs")
    public ResponseEntity<List<Fournisseur>> listerFournisseurs() {
        List<Fournisseur> fournisseurs = fournisseurService.getTousLesFournisseurs();
        return new ResponseEntity<>(fournisseurs, HttpStatus.OK);
    }
    // Rechercher des articles par nom, code ou famille
    @GetMapping("/search")
    public ResponseEntity<List<Article>> rechercherArticles(
            @RequestParam(value = "nom", required = false) String nom,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "famille", required = false) String famille) {

        List<Article> articles = articleService.rechercherArticles(nom, code, famille);
        return ResponseEntity.ok(articles);
    }


}
