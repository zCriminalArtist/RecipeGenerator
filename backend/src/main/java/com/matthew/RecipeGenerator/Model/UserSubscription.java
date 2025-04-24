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

    private Integer userId;

    private String platform; // "ios" or "android"
    private String productId;

    private String originalTransactionId;
    private String latestTransactionId;

    private Instant purchaseDate;
    private Instant expirationDate;
    private Instant cancellationDate;

    private boolean isTrial;
    private boolean isAutoRenew;
    private String status;

    private Instant lastVerifiedAt;
}