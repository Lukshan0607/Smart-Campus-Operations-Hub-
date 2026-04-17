package com.smartcampus.repository;

import org.springframework.data.jpa.domain.Specification;

import com.smartcampus.entity.Resource;
import com.smartcampus.entity.Resource.ResourceStatus;
import com.smartcampus.entity.Resource.ResourceType;

public final class ResourceSpecifications {
    private ResourceSpecifications() {}

    public static Specification<Resource> statusEquals(ResourceStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Resource> typeEquals(ResourceType type) {
        return (root, query, cb) -> type == null ? cb.conjunction() : cb.equal(root.get("type"), type);
    }

    public static Specification<Resource> nameContains(String q) {
        return (root, query, cb) -> (q == null || q.isBlank())
            ? cb.conjunction()
            : cb.like(cb.lower(root.get("name")), "%" + q.toLowerCase() + "%");
    }

    public static Specification<Resource> locationContains(String location) {
        return (root, query, cb) -> (location == null || location.isBlank())
            ? cb.conjunction()
            : cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }
}

