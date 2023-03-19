package ca.mcgill.documentserver.control;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "users")
public class User {
  
  @Id
  String username;
  
  //TODO: Idea for document editor: split the document into sections and allow one user at a time to claim a section.
  //TODO: In combination with a chat app which can reference other sections, comments can be enabled. 
  //TODO: It's actually a private message board... kinda stole the idea from a group already. 
  
  public User() {}
  
  public User(String username) {
    this.username = username;
  }
  
  public String getUserName() {
    return username;
  }

}
