package ca.mcgill.documentserver.control;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.LoginForm;
import ca.mcgill.documentserver.model.Role;
import ca.mcgill.documentserver.model.User;
import ca.mcgill.documentserver.model.UserRepository;

@RestController
public class LoginManager {
  
  @Autowired
  UserRepository repository;
  
  BCryptPasswordEncoder encoder;
  
  public LoginManager() {
    System.out.println("Manager");
    encoder = new BCryptPasswordEncoder(12, new SecureRandom());
  }
  
  @PutMapping("/api/players/{playername}")
  public String addPlayer(@PathVariable String playername, @RequestBody String password) {
    if (repository.findById(playername).isPresent()) {
      return "Name already taken\n";
    }
    User newUser = new User(playername, Role.ADMIN, encoder.encode(password));
    repository.saveAndFlush(newUser);
    return playername;
  }
  
  @PostMapping(value = "/api/login", consumes = "application/json; charset=utf-8")
  public String login(@RequestBody LoginForm loginForm) {
    if (!repository.findById(loginForm.getUsername()).isPresent()) {
      return "Invalid Credentials1\n";
    }
    if (!encoder.matches(loginForm.getPassword(), 
        repository.findById(loginForm.getUsername()).get().getPassword())) {
      return "Invalid Credentials2\n";
    }
    return "Token";
  }
  
  @GetMapping("/api/players")
  public String getPlayers() {
    String ret = "";
    for (User name : repository.findAll()) {
      ret += name.getUserName() + "\n";
    }
    return ret;
  }

}
