package ca.mcgill.documentserver.model;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String>{

}
