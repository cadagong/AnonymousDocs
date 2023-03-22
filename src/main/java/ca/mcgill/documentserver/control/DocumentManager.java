package ca.mcgill.documentserver.control;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.Document;
import ca.mcgill.documentserver.model.DocumentForm;
import ca.mcgill.documentserver.model.DocumentRepository;
import ca.mcgill.documentserver.model.DocumentSection;
import ca.mcgill.documentserver.model.SectionRepository;
import ca.mcgill.documentserver.model.User;
import ca.mcgill.documentserver.model.UserRepository;

@RestController
public class DocumentManager {
  
  @Autowired
  private DocumentRepository documentRepo;
  
  @Autowired
  private SectionRepository sectionRepo;
  
  @Autowired
  private UserRepository userRepo;
  
  private Map<String, User> ownershipMap;
  
  public DocumentManager() {
  }
  
  @GetMapping("/api/online")
  public String online() {
    return "Up and Running\n";
  }
  
  @PutMapping("/document")
  public void createDocument(@RequestBody DocumentForm docForm) {
    Document document = new Document();
    for (int i = 0; i < docForm.getNumberOfSections(); ++i) {
      DocumentSection section = new DocumentSection();
      sectionRepo.save(section);
      document.addSection(section);
    }
    for (String username : docForm.getContributorNames()) {
      User user = userRepo.findById(username).get();
      document.addContributor(user);
    }
    documentRepo.save(document);
  }

}
