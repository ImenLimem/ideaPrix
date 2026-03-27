package IdealPrix.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter; // Importation correcte de CorsFilter

@Configuration
public class CrosConfig {

    @Bean
    public CorsFilter corsFilter() {
        // Créer une configuration CORS
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("http://localhost:4200");  // Autoriser l'origine de l'app Angular
        corsConfiguration.addAllowedMethod("GET");
        corsConfiguration.addAllowedMethod("POST");
        corsConfiguration.addAllowedMethod("PUT");
        corsConfiguration.addAllowedMethod("DELETE");
        corsConfiguration.addAllowedHeader("*"); // Autoriser toutes les entêtes

        // Créer la source de configuration CORS
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration); // Appliquer CORS à toutes les routes

        // Retourner un CorsFilter pour que Spring l'utilise
        return new CorsFilter(source);  // Utiliser CorsFilter de Spring et non de Tomcat
    }
}
