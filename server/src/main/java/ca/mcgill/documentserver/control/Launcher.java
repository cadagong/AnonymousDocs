package ca.mcgill.documentserver.control;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Launcher {

  /**
   * Creates a Launcher.
   */
  public Launcher() {

  }

  /**
   * Runs the Spring Application.
   *
   * @param args the arguments
   */
  public static void main(String[] args) {
    SpringApplication.run(Launcher.class, args);
  }
}
