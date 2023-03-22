package ca.mcgill.documentserver.model;

import java.util.List;

public class DocumentForm {
  
//  private String creatorToken;
  
  private List<String> contributorNames;
  
  private int nSections;
  
  public DocumentForm(List<String> contributorNames, int nSections) {
//    this.creatorToken = creatorToken;
    this.contributorNames = contributorNames;
    this.nSections = nSections;
  }
  
//  public String getCreatorToken() {
//    return creatorToken;
//  }
  
  public List<String> getContributorNames() {
    return contributorNames;
  }
  
  public int getNumberOfSections() {
    return nSections;
  }

}
