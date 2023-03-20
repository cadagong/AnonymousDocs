package ca.mcgill.documentserver.model;

public class LoginForm {
  
  private String username;
  private String password;

  public LoginForm() {}
  
  public LoginForm(String username, String password) {
    this.username = username;
    this.password = password;
  }
  
  public String getUsername() {
    return username;
  }
  
  public String getPassword() {
    return password;
  }
}
