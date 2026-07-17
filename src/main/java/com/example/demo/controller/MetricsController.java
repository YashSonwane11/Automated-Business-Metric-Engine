package com.example.demo.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class MetricsController {

    private final JdbcTemplate jdbcTemplate;

    public MetricsController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/metrics/daily-summary")
    public List<Map<String, Object>> getDailySummary() {
        String sql = """
            SELECT
                metric_date,
                category,
                total_orders,
                total_quantity,
                gross_revenue,
                total_discount,
                net_revenue,
                avg_order_value,
                rolling_7_day_revenue,
                cumulative_revenue,
                category_rank,
                created_at
            FROM business_metrics_summary
            ORDER BY metric_date, category_rank
        """;

        return jdbcTemplate.queryForList(sql);
    }
}
