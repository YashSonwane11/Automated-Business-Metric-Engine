package com.example.demo.controller;

import com.example.demo.model.UploadHistory;
import com.example.demo.repository.UploadHistoryRepository;
import com.example.demo.service.MetricsTransformationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final JdbcTemplate jdbcTemplate;
    private final UploadHistoryRepository historyRepository;
    private final MetricsTransformationService metricsTransformationService;

    public UploadController(JdbcTemplate jdbcTemplate,
                            UploadHistoryRepository historyRepository,
                            MetricsTransformationService metricsTransformationService) {
        this.jdbcTemplate = jdbcTemplate;
        this.historyRepository = historyRepository;
        this.metricsTransformationService = metricsTransformationService;
    }

    @PostMapping("/csv")
    public ResponseEntity<Map<String, Object>> uploadCsv(@RequestParam("file") MultipartFile file) {
        UploadHistory uploadHistory = new UploadHistory();
        uploadHistory.setFileName(file.getOriginalFilename());
        uploadHistory.setUploadedAt(LocalDateTime.now());
        uploadHistory.setStatus("STARTED");
        uploadHistory.setRowCount(0);
        uploadHistory = historyRepository.save(uploadHistory);

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String header = reader.readLine();
            if (header == null) {
                throw new IllegalArgumentException("CSV file is empty");
            }

            String sql = "INSERT INTO raw_sales_data (order_id, order_date, customer_id, customer_name, category, product_name, quantity, unit_price, discount, revenue, payment_method, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            DateTimeFormatter dashFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter slashFormatter = DateTimeFormatter.ofPattern("yyyy/MM/dd");
            List<Object[]> batchArgs = new ArrayList<>();
            String line;
            int imported = 0;
            int skipped = 0;
            int lineNumber = 1;
            List<String> skippedDetails = new ArrayList<>();

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }

                try {
                    String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);

                    if (parts.length != 11) {
                        skipped++;
                        skippedDetails.add("Row " + lineNumber + ": Expected 11 columns, found " + parts.length);
                        continue;
                    }

                    String orderId = cleanString(parts[0]);
                    String rawDate = parts[1].trim().replace('/', '-');
                    String customerId = cleanString(parts[2]);
                    String customerName = cleanString(parts[3]);
                    String category = cleanString(parts[4]);
                    String productName = cleanString(parts[5]);
                    String rawQuantity = parts[6].trim();
                    String rawPrice = parts[7].trim();
                    String rawDiscount = parts[8].trim();
                    String paymentMethod = cleanString(parts[9]);
                    String region = cleanString(parts[10]);

                    // Parse date — skip row if date is missing or invalid
                    LocalDate orderDate;
                    if (rawDate.isBlank()) {
                        skipped++;
                        skippedDetails.add("Row " + lineNumber + ": Missing order_date");
                        continue;
                    }
                    try {
                        orderDate = LocalDate.parse(rawDate, dashFormatter);
                    } catch (Exception e) {
                        try {
                            orderDate = LocalDate.parse(parts[1].trim(), slashFormatter);
                        } catch (Exception e2) {
                            skipped++;
                            skippedDetails.add("Row " + lineNumber + ": Invalid date '" + parts[1].trim() + "'");
                            continue;
                        }
                    }

                    // Parse quantity — default 0 if missing/invalid
                    int quantity = 0;
                    if (!rawQuantity.isBlank()) {
                        try {
                            quantity = Integer.parseInt(rawQuantity);
                        } catch (NumberFormatException e) {
                            quantity = 0;
                        }
                    }

                    // Parse unit_price — default 0 if missing/invalid
                    BigDecimal unitPrice = BigDecimal.ZERO;
                    if (!rawPrice.isBlank()) {
                        try {
                            unitPrice = new BigDecimal(rawPrice);
                        } catch (NumberFormatException e) {
                            unitPrice = BigDecimal.ZERO;
                        }
                    }

                    // Parse discount — default 0 if missing/invalid
                    BigDecimal discount = BigDecimal.ZERO;
                    if (!rawDiscount.isBlank()) {
                        try {
                            discount = new BigDecimal(rawDiscount);
                        } catch (NumberFormatException e) {
                            discount = BigDecimal.ZERO;
                        }
                    }

                    // Calculate revenue: (quantity * unit_price) - discount
                    BigDecimal revenue = unitPrice.multiply(BigDecimal.valueOf(quantity)).subtract(discount);

                    batchArgs.add(new Object[]{
                            orderId,
                            orderDate,
                            customerId,
                            customerName,
                            category,
                            productName,
                            quantity,
                            unitPrice,
                            discount,
                            revenue,
                            paymentMethod,
                            region
                    });
                    imported++;

                    if (batchArgs.size() >= 200) {
                        jdbcTemplate.batchUpdate(sql, batchArgs);
                        batchArgs.clear();
                    }

                } catch (Exception rowEx) {
                    skipped++;
                    skippedDetails.add("Row " + lineNumber + ": " + rowEx.getMessage());
                }
            }

            if (!batchArgs.isEmpty()) {
                jdbcTemplate.batchUpdate(sql, batchArgs);
            }

            uploadHistory.setStatus("COMPLETED");
            uploadHistory.setRowCount(imported);
            uploadHistory.setErrorMessage(skipped > 0 ? skipped + " rows skipped" : null);
            historyRepository.save(uploadHistory);

            // Auto-recalculate business metrics after successful import
            try {
                metricsTransformationService.calculateBusinessMetrics();
            } catch (Exception e) {
                System.err.println("Metrics recalculation warning: " + e.getMessage());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("rowsImported", imported);
            response.put("rowsSkipped", skipped);
            response.put("message", imported + " rows imported successfully" + (skipped > 0 ? ", " + skipped + " rows skipped" : ""));
            if (!skippedDetails.isEmpty()) {
                response.put("skippedDetails", skippedDetails.size() > 20 ? skippedDetails.subList(0, 20) : skippedDetails);
            }
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            uploadHistory.setStatus("FAILED");
            uploadHistory.setErrorMessage(ex.getMessage());
            historyRepository.save(uploadHistory);
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        } catch (Exception ex) {
            uploadHistory.setStatus("FAILED");
            uploadHistory.setErrorMessage(ex.getMessage());
            historyRepository.save(uploadHistory);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to process upload: " + ex.getMessage()));
        }
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearAllData() {
        try {
            jdbcTemplate.execute("TRUNCATE TABLE business_metrics_summary RESTART IDENTITY CASCADE");
            jdbcTemplate.execute("TRUNCATE TABLE raw_sales_data RESTART IDENTITY CASCADE");
            jdbcTemplate.execute("TRUNCATE TABLE upload_history RESTART IDENTITY CASCADE");
            jdbcTemplate.execute("TRUNCATE TABLE batch_job_run RESTART IDENTITY CASCADE");
            return ResponseEntity.ok(Map.of("message", "All database tables cleared successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear database: " + ex.getMessage()));
        }
    }

    private String cleanString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "UNKNOWN";
        }
        return value.trim();
    }

    @GetMapping("/history")
    public List<UploadHistory> getUploadHistory() {
        return historyRepository.findTop20ByOrderByUploadedAtDesc();
    }
}
