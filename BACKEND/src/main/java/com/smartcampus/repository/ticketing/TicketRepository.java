package com.smartcampus.repository.ticketing;

import com.smartcampus.entity.ticketing.Ticket;
import com.smartcampus.entity.ticketing.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatorId(Long creatorId);

    List<Ticket> findByAssignedTechnicianId(Long technicianId);

    List<Ticket> findByStatus(TicketStatus status);

    @Query("SELECT t FROM Ticket t WHERE t.creatorId = :userId OR t.assignedTechnicianId = :userId OR :isAdmin = true")
    List<Ticket> findUserTickets(@Param("userId") Long userId, @Param("isAdmin") boolean isAdmin);
}
