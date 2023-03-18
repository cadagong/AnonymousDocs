package ca.mcgill.documentserver.control;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.UserRepository;

@RestController
public class LoginManager {
  
  @Autowired
  UserRepository repository;
  
  public LoginManager() {
    System.out.println("Manager");
  }

}
