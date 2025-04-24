package com.matthew.RecipeGenerator.Model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.ZonedDateTime;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Data
public class UserSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String platform; // "ios" or "android"
    private String productId;

    @Column(unique = true)
    private String originalTransactionId;
    private String latestTransactionId;

    private Instant purchaseDate;
    private Instant expirationDate;
    private Instant cancellationDate;

    private boolean isTrial;
    private boolean isAutoRenew;
    private String status;

    private Instant lastVerifiedAt;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false, unique = true)
    private User user;
}