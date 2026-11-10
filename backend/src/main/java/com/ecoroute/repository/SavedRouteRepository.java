package com.ecoroute.repository;

import com.ecoroute.entity.SavedRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedRouteRepository extends JpaRepository<SavedRoute, Long> {
    List<SavedRoute> findByUserIdOrderByCreatedAtDesc(Long userId);
    Long countByUserId(Long userId);
}
