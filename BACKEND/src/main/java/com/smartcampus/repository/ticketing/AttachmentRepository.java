package com.smartcampus.repository.ticketing;

import com.smartcampus.entity.ticketing.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByTicketId(Long ticketId);

    long countByTicketId(Long ticketId);
}
