package ca.mcgill.documentserver.config;


import java.util.Properties;

import javax.sql.DataSource;

import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.orm.hibernate5.LocalSessionFactoryBuilder;

public class HibernateConfig {
  
  @Autowired
  @Bean(name = "sessionFactory")
  public SessionFactory getSessionFactory(DataSource dataSource) {

      LocalSessionFactoryBuilder sessionBuilder = new LocalSessionFactoryBuilder(dataSource);
      sessionBuilder.addProperties(getHibernateProperties());
      return sessionBuilder.buildSessionFactory();
  }

  private Properties getHibernateProperties() {
      Properties properties = new Properties();
      properties.put("hibernate.show_sql", "true");
      properties.put("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
      properties.put("hibernate.id.new_generator_mappings","false");
      return properties;
  }
}
