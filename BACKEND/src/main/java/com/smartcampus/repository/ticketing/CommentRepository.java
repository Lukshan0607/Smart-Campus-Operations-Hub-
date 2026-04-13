package com.smartcampus.repository.ticketing;

import com.smartcampus.entity.ticketing.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("select c from Comment c join fetch c.ticket t where t.id = :ticketId order by c.createdAt asc")
    List<Comment> findByTicketId(@Param("ticketId") Long ticketId);

    List<Comment> findByAuthorId(Long authorId);
}
