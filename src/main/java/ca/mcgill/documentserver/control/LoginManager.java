package ca.mcgill.documentserver.control;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.User;
import ca.mcgill.documentserver.model.UserRepository;

//@RestController
public class LoginManager {
  
//  @Autowired
//  UserRepository repository;
//  
//  public LoginManager() {
//    System.out.println("Manager");
//  }
//  
//  @PutMapping("/api/players/add/{playername}")
//  public String addPlayer(@PathVariable String playername) {
//    User newUser = new User(playername);
//    repository.save(newUser);
//    return playername;
//  }
//  
//  @GetMapping("/api/players/get")
//  public String getPlayers() {
//    String ret = "";
//    for (User name : repository.findAll()) {
//      ret += name.getUserName() + "\n";
//    }
//    return ret;
//  }

}
