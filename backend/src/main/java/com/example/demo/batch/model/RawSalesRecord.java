package com.example.demo.batch.model;

import lombok.Data;

@Data
public class RawSalesRecord {
    private String orderId;
    private String orderDate;
    private String customerId;
    private String customerName;
    private String category;
    private String productName;
    private String quantity;
    private String unitPrice;
    private String discount;
    private String paymentMethod;
    private String region;
}
