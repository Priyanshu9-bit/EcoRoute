package com.ecoroute.dto;

import com.ecoroute.entity.AccountStatus;
import com.ecoroute.entity.Role;

import java.time.LocalDateTime;

public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private AccountStatus accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean profileCompleted;

    public UserDTO() {
    }

    public UserDTO(Long id, String name, String email, Role role, AccountStatus accountStatus, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean profileCompleted) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.profileCompleted = profileCompleted;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public static UserDTOBuilder builder() {
        return new UserDTOBuilder();
    }

    public static class UserDTOBuilder {
        private Long id;
        private String name;
        private String email;
        private Role role;
        private AccountStatus accountStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean profileCompleted;

        public UserDTOBuilder id(Long id) { this.id = id; return this; }
        public UserDTOBuilder name(String name) { this.name = name; return this; }
        public UserDTOBuilder email(String email) { this.email = email; return this; }
        public UserDTOBuilder role(Role role) { this.role = role; return this; }
        public UserDTOBuilder accountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; return this; }
        public UserDTOBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserDTOBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public UserDTOBuilder profileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; return this; }

        public UserDTO build() {
            return new UserDTO(id, name, email, role, accountStatus, createdAt, updatedAt, profileCompleted);
        }
    }
}
