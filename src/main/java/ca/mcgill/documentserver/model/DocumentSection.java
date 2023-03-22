package ca.mcgill.documentserver.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "documentsections")
public class DocumentSection {

  @Id
  @Column(name="section_id")
  public Integer id = 0;
  
  public String content;
  
  public DocumentSection() {
    
  }
  
}
