package ca.mcgill.documentserver.control;

import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import ca.mcgill.documentserver.model.Role;
import ca.mcgill.documentserver.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenManager {

  @Value("${password}")
  private String secret;
  
  private List<String> tokens = new ArrayList<String>();
  
  public boolean validateToken(String token) {
    if (!tokens.contains(token)) {
      return false;
    }
    try {
       Claims claims = Jwts.parserBuilder()
       .setSigningKey(getSigningKey())
       .build()
       .parseClaimsJws(token).getBody();
    }
    catch (JwtException e) {
      return false;
    }
    return true;
  }
  
  public boolean hasAuthority(String token) {
    assert validateToken(token);
    Claims claims = Jwts.parserBuilder()
        .setSigningKey(getSigningKey())
        .build()
        .parseClaimsJws(token).getBody();
    String role = (String)claims.get("role");
    return role.equals("ADMIN");
  }
  
  private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(this.secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }
  
  public String getToken(User user) {
    Date expDate = new Date();
    //expire after 10000 seconds
    expDate.setTime(expDate.getTime() + 10000000);
    String jws = Jwts.builder()
        .claim("role", user.getRole())
        .setSubject(user.getUserName())
        .setExpiration(expDate)
        .signWith(getSigningKey())
        .compact();
    tokens.add(jws);
    return jws;
  }
  
}
