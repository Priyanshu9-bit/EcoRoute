package com.ecoroute.repository;

import com.ecoroute.entity.Journey;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JourneyRepository extends JpaRepository<Journey, Long> {
    List<Journey> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Journey> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Journey> findByIdAndUserId(Long id, Long userId);
    Long countByUserId(Long userId);
}
