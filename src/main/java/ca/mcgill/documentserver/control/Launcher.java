package ca.mcgill.documentserver.control;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication(scanBasePackages = {"ca.mcgill.documentserver"}, exclude = { SecurityAutoConfiguration.class })
@EnableJpaRepositories("ca.mcgill.documentserver")
@EntityScan("ca.mcgill.documentserver")
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
