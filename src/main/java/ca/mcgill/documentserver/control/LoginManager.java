package ca.mcgill.documentserver.control;

import java.security.SecureRandom;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import ca.mcgill.documentserver.model.LoginForm;
import ca.mcgill.documentserver.model.User;
import ca.mcgill.documentserver.model.UserForm;
import ca.mcgill.documentserver.model.UserRepository;

@RestController
public class LoginManager {
  
  @Autowired
  UserRepository repository;
  
  @Autowired 
  TokenManager tokenManager;
  
  BCryptPasswordEncoder encoder;
  
  public LoginManager() {
    System.out.println("Manager");
    encoder = new BCryptPasswordEncoder(12, new SecureRandom());
  }
  
  @PutMapping("/api/users")
  public String addUser(@RequestBody UserForm userForm) {
    if (!tokenManager.validateToken(userForm.getToken()) 
        || !tokenManager.hasAuthority(userForm.getToken())) {
      return "Invalid Credentials\n";
    }
    if (repository.findById(userForm.getUsername()).isPresent()) {
      return "Name already taken\n";
    }
    User newUser = new User(userForm.getUsername(), userForm.getRole(), encoder.encode(userForm.getPassword()));
    repository.saveAndFlush(newUser);
    return userForm.getUsername();
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
    return tokenManager.getToken(repository.findById(loginForm.getUsername()).get());
  }
  
  @GetMapping("/api/users")
  public String getPlayers() {
    String ret = "";
    for (User name : repository.findAll()) {
      ret += name.getUserName() + "\n";
    }
    return ret;
  }

}
