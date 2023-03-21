package ca.mcgill.documentserver.control;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.User;

@RestController
public class DocumentManager {
  
  private Map<String, User> ownershipMap;
  
  public DocumentManager() {
    
  }
  
  @GetMapping("/api/online")
  public String online() {
    return "Up and Running\n";
  }

}
