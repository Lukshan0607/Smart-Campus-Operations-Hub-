package com.smartcampus.repository.ticketing;

import com.smartcampus.entity.ticketing.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTicketId(Long ticketId);

    List<Comment> findByAuthorId(Long authorId);
}
