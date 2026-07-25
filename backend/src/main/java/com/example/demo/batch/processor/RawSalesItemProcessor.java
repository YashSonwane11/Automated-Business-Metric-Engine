package com.example.demo.batch.processor;

import com.example.demo.batch.model.RawSalesRecord;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Component
public class RawSalesItemProcessor {

    public RawSalesRecord process(RawSalesRecord item) {
        try {
            item.setOrderId(clean(item.getOrderId()));
            item.setCustomerId(clean(item.getCustomerId()));
            item.setCustomerName(clean(item.getCustomerName()));
            item.setCategory(clean(item.getCategory()));
            item.setProductName(clean(item.getProductName()));
            item.setPaymentMethod(clean(item.getPaymentMethod()));
            item.setRegion(clean(item.getRegion()));

            item.setOrderDate(standardizeDate(item.getOrderDate()));
            item.setQuantity(defaultNumber(item.getQuantity()));
            item.setUnitPrice(defaultDecimal(item.getUnitPrice()));
            item.setDiscount(defaultDecimal(item.getDiscount()));

            return item;

        } catch (Exception e) {
            System.err.println("Corrupted row skipped: " + item + " | Error: " + e.getMessage());
            return null;
        }
    }

    private String clean(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "UNKNOWN";
        }
        return value.trim();
    }

    private String defaultNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "0";
        }
        Integer.parseInt(value.trim());
        return value.trim();
    }

    private String defaultDecimal(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "0";
        }
        new BigDecimal(value.trim());
        return value.trim();
    }

    private String standardizeDate(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Missing order date");
        }

        String cleaned = value.trim();

        if (cleaned.contains("/")) {
            LocalDate date = LocalDate.parse(cleaned, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            return date.toString();
        }

        LocalDate date = LocalDate.parse(cleaned, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return date.toString();
    }
}
