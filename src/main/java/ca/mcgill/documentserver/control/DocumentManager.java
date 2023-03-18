package ca.mcgill.documentserver.control;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DocumentManager {
  
  @GetMapping("/api/online")
  public String online() {
    return "Up and Running\n";
  }

}
