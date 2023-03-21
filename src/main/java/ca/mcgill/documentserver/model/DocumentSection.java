package ca.mcgill.documentserver.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "documentsections")
public class DocumentSection {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  
  @ManyToOne
  private Document document;
  
  public DocumentSection() {
    
  }
  
}
