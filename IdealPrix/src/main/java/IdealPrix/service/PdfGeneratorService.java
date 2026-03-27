package IdealPrix.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;

@Service
public class PdfGeneratorService {
    public File generatePdfFromHtml(String htmlContent, String fileName) throws Exception {
        File file = new File(System.getProperty("java.io.tmpdir"), fileName + ".pdf");

        try (FileOutputStream os = new FileOutputStream(file)) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();
        }

        return file;
    }
}