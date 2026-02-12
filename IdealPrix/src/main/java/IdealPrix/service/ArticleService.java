package IdealPrix.service;

import IdealPrix.model.Article;
import IdealPrix.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    // Ajouter un nouvel article
    public Article ajouterArticle(Article article) {
        return articleRepository.save(article);  // Enregistrement de l'article dans la base de données
    }

    // Supprimer un article
    public void supprimerArticle(Long id) {
        articleRepository.deleteById(id);
    }

    // Modifier un article existant
    public Article modifierArticle(Long id, Article articleModifie) {
        Optional<Article> articleExist = articleRepository.findById(id);
        if (articleExist.isPresent()) {
            Article article = articleExist.get();
            article.setNom(articleModifie.getNom());
            article.setCode(articleModifie.getCode());
            article.setFournisseur(articleModifie.getFournisseur());
            article.setPrixAchat(articleModifie.getPrixAchat());
            article.setImage(articleModifie.getImage());
            article.setPrixVente(articleModifie.getPrixVente());
            return articleRepository.save(article);
        } else {
            return null; // Si l'article n'existe pas
        }
    }

    // Afficher les détails d'un article par son ID
    public Optional<Article> afficherDetails(Long id) {
        return articleRepository.findById(id);
    }


    // Lister tous les articles
    public List<Article> listerArticles() {
        // Utiliser une requête JOIN FETCH pour récupérer les articles avec leurs fournisseurs
        return articleRepository.findAllWithFournisseur();
    }
    // Recherche d'un article par ID
    public Article rechercherArticle(Long id) {
        Optional<Article> article = articleRepository.findById(id);
        return article.orElse(null); // Retourner l'article ou null si non trouvé
    }
    public List<Article> rechercherArticles(String nom, String code, String famille) {
        if (nom != null && !nom.isEmpty()) {
            return articleRepository.findByNomContainingIgnoreCase(nom);
        } else if (code != null && !code.isEmpty()) {
            return articleRepository.findByCodeContainingIgnoreCase(code);
        } else if (famille != null && !famille.isEmpty()) {
            return articleRepository.findByFamilleContainingIgnoreCase(famille);
        } else {
            return listerArticles(); // Si aucun paramètre, retourne tous les articles
        }
    }


}

