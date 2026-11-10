package com.ecoroute.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Boolean profileCompleted;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String name, String email, String role, Boolean profileCompleted) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.profileCompleted = profileCompleted;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getProfileCompleted() { return profileCompleted; }
    public void setProfileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private Long userId;
        private String name;
        private String email;
        private String role;
        private Boolean profileCompleted;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder profileCompleted(Boolean profileCompleted) { this.profileCompleted = profileCompleted; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, userId, name, email, role, profileCompleted);
        }
    }
}
