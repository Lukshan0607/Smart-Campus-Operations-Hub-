package com.smartcampus.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    @Query("SELECT r FROM Resource r WHERE r.status = :status AND LOWER(r.type) LIKE LOWER(CONCAT('%', :type, '%'))")
    Page<Resource> findByStatusAndTypeContaining(@Param("status") ResourceStatus status, @Param("type") String type, Pageable pageable);

    Page<Resource> findByStatus(ResourceStatus status, Pageable pageable);

    List<Resource> findByStatus(ResourceStatus status);

    Optional<Resource> findByQrCodeHash(String qrCodeHash);

    boolean existsByName(String name);

    @Query("SELECT r FROM Resource r WHERE r.status = 'ACTIVE' AND r.id NOT IN " +
           "(SELECT b.resource.id FROM Booking b WHERE b.startTime < :endTime AND b.endTime > :startTime AND b.status != 'CANCELLED')")
    Page<Resource> findAvailableResourcesForTimeSlot(@Param("startTime") LocalDateTime startTime,
                                                     @Param("endTime") LocalDateTime endTime,
                                                     Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.startTime < :endTime AND b.endTime > :startTime AND b.status != 'CANCELLED'")
    int getBookedQuantityForTimeRange(@Param("resourceId") Long resourceId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);
}

