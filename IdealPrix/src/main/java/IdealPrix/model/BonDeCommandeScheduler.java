package IdealPrix.model;

import IdealPrix.repository.BonDeCommandeRepository;
import IdealPrix.service.EmailService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Component
public class BonDeCommandeScheduler {

    private final BonDeCommandeRepository bonDeCommandeRepository;
    private final EmailService emailService;
    private final String defaultDestinataire = "Limemimen1999@gmail.com"; // Email fixe

    public BonDeCommandeScheduler(BonDeCommandeRepository bonDeCommandeRepository, EmailService emailService) {
        this.bonDeCommandeRepository = bonDeCommandeRepository;
        this.emailService = emailService;
    }

    // Planification tous les jours à minuit (00:00)
    @Scheduled(cron = "0 0 0 * * ?", zone = "Africa/Tunis")
    public void envoyerEmailsAutomatiques() {
        LocalDate today = LocalDate.now(ZoneId.systemDefault()); // date actuelle
        System.out.println("Vérification des bons de commande pour la date : " + today);

        List<BonDeCommande> commandes = bonDeCommandeRepository.findAll();

        for (BonDeCommande bc : commandes) {

            boolean emailEnvoye = false;

            if (bc.getDateExpedition() != null && bc.getDateExpedition().toLocalDate().isEqual(today)) {
                envoyerMail(bc, "Notification d'expédition de commande");
                emailEnvoye = true;
            }

            if (bc.getDateLivraison() != null && bc.getDateLivraison().toLocalDate().isEqual(today)) {
                envoyerMail(bc, "Notification de livraison de commande");
                emailEnvoye = true;
            }

            if (emailEnvoye) {
                System.out.println("Email envoyé pour le bon de commande : " + bc.getNumeroBonCommande());
            }
        }
    }

    private void envoyerMail(BonDeCommande bc, String sujet) {

        String fournisseurNom = bc.getFournisseur() != null ? bc.getFournisseur().getNom() : "Non défini";
        String fournisseurPrenom = bc.getFournisseur() != null ? bc.getFournisseur().getPrenom() : "";

        Double totalTtc = bc.getTotalTtc() != null ? bc.getTotalTtc() : 0.0;

        String corps = "<html>" +
                "<body style='font-family:Arial,sans-serif;line-height:1.5;color:#333;'>" +
                "<h2 style='color:#2E86C1;'>Notification de commande</h2>" +
                "<p>Bonjour,</p>" +
                "<p>Nous vous informons que le bon de commande suivant est prévu pour aujourd'hui :</p>" +
                "<table style='border-collapse: collapse; width: 100%;'>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Numéro du bon de commande</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" + bc.getNumeroBonCommande() + "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Description</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" + bc.getDescription() + "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Fournisseur</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" + fournisseurNom + " " + fournisseurPrenom + "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Date de commande</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" +
                (bc.getDateCommande() != null ? bc.getDateCommande().toLocalDate() : "N/A") +
                "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Date d'expédition</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" +
                (bc.getDateExpedition() != null ? bc.getDateExpedition().toLocalDate() : "N/A") +
                "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Date de livraison</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" +
                (bc.getDateLivraison() != null ? bc.getDateLivraison().toLocalDate() : "N/A") +
                "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px;'>Statut</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px;'>" +
                (bc.getStatut() != null ? bc.getStatut() : "N/A") +
                "</td></tr>" +

                "<tr><td style='border: 1px solid #ccc; padding: 8px; font-weight:bold;'>Total TTC</td>" +
                "<td style='border: 1px solid #ccc; padding: 8px; font-weight:bold;'>" +
                String.format("%.2f", totalTtc) + " $</td></tr>" +

                "</table>" +

                "<p>Merci de prendre les mesures nécessaires et de suivre cette commande.</p>" +
                "</body></html>";

        emailService.envoyerEmailHTML(defaultDestinataire, sujet, corps);
    }

}