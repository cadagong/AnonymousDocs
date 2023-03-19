package ca.mcgill.documentserver.model;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "users")
public class User {
  
  @Id
  private String username;
  private String password;
  
  @Enumerated(EnumType.STRING)
  private Role role;
  
  //TODO: Idea for document editor: split the document into sections and allow one user at a time to claim a section.
  //TODO: In combination with a chat app which can reference other sections, comments can be enabled. 
  //TODO: It's actually a private message board... kinda stole the idea from a group already. 
  
  public User() {}
  
  public User(String username, Role role, String password) {
    this.username = username;
    this.role = role;
    this.password = password;
  }
  
  public String getUserName() {
    return username;
  }
  
  public Role getRole() {
    return role;
  }
  
  public String getPassword() {
    return password;
  }

}
