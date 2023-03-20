package ca.mcgill.documentserver.control;

import java.security.Key;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class TokenManager {

  @Value("${password}")
  private String secret;
  
  private List<String> tokens;
  
  public boolean validateToken(String token) {
    if (!tokens.contains(token)) {
      return false;
    }
    try {
       Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
    }
    catch (JwtException e) {
      return false;
    }
    return true;
  }
  
  private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(this.secret);
    return Keys.hmacShaKeyFor(keyBytes);
  }
  
  public String getToken() {
    String jws = Jwts.builder().setSubject("Joe").signWith(getSigningKey()).compact();
    return jws;
  }
  
}
