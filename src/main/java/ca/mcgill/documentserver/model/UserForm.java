package ca.mcgill.documentserver.model;

public class UserForm {
  
  private String token;
  private String username;
  private String password;
  private Role role;
  
  public UserForm(String auth, String name, String pword, Role role) {
    token = auth;
    username = name;
    pword = password;
    this.role = role;
  }
  
  public String getUsername() {
    return username;
  }
  
  public String getPassword() {
    return password;
  }
  
  public Role getRole() {
    return role;
  }
  
  public String getToken() {
    return token;
  }

}
