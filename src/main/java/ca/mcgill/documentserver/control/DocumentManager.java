package ca.mcgill.documentserver.control;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DocumentManager {
  
  @GetMapping("/online")
  public String online() {
    return "Up and Running\n";
  }
  
  DocumentManager() {
    System.out.println("In here");
  }

}
