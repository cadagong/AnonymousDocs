package ca.mcgill.documentserver.model;

import javax.persistence.Entity;
import javax.persistence.Id;

@Entity
public class User {
  
  @Id
  String username;
  
  //TODO: Idea for document editor: split the document into sections and allow one user at a time to claim a section.
  //TODO: In combination with a chat app which can reference other sections, comments can be enabled. 
  //TODO: It's actually a private message board... kinda stole the idea from a group already. 

}
