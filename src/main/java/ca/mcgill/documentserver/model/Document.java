package ca.mcgill.documentserver.model;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "documents")
public class Document {
  
  @Id
  @GeneratedValue(strategy= GenerationType.AUTO)
  private int documentId;
  
  @OneToMany
  List<DocumentSection> sections;
  
  @OneToMany
  List<User> contributors;

}
