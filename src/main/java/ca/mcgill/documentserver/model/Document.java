package ca.mcgill.documentserver.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "documents")
public class Document {
  
  @Id
  private Integer documentId;
  
  @OneToMany
  @JoinColumn(name = "section_id")
  private List<DocumentSection> sections = new ArrayList<DocumentSection>();
  
  @ManyToMany
  @JoinTable(name = "document_users", 
  joinColumns = @JoinColumn(name = "doc_id", referencedColumnName = "documentId"), 
  inverseJoinColumns = @JoinColumn(name = "username", referencedColumnName = "username"))
  private List<User> contributors = new ArrayList<User>();
  
  
  public Document() {}
  
  public void addContributor(User user) {
    contributors.add(user);
  }
  
  public void addSection(DocumentSection section) {
    sections.add(section);
  }

}
