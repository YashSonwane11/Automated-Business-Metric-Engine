package com.example.demo.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class MetricsTransformationService {

    private final JdbcTemplate jdbcTemplate;

    public MetricsTransformationService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void calculateBusinessMetrics() {

        // Clear old metrics and recalculate from scratch
        jdbcTemplate.update("DELETE FROM business_metrics_summary");

        String sql = """
            
            INSERT INTO business_metrics_summary
            (
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
                category_rank
            )

            WITH daily_metrics AS (

                SELECT
                    order_date AS metric_date,
                    category,

                    COUNT(order_id) AS total_orders,

                    SUM(quantity) AS total_quantity,

                    SUM(quantity * unit_price) AS gross_revenue,

                    SUM(discount) AS total_discount,

                    SUM(revenue) AS net_revenue,

                    AVG(revenue) AS avg_order_value

                FROM raw_sales_data
                WHERE order_date IS NOT NULL
                  AND category IS NOT NULL
                  AND category != 'UNKNOWN'

                GROUP BY order_date, category
            ),

            ranked_metrics AS (

                SELECT
                    *,

                    SUM(net_revenue)
                    OVER (
                        PARTITION BY category
                        ORDER BY metric_date
                    ) AS cumulative_revenue,

                    AVG(net_revenue)
                    OVER (
                        PARTITION BY category
                        ORDER BY metric_date
                        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                    ) AS rolling_7_day_revenue,

                    RANK()
                    OVER (
                        PARTITION BY metric_date
                        ORDER BY net_revenue DESC
                    ) AS category_rank

                FROM daily_metrics
            )

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
                category_rank

            FROM ranked_metrics

            ON CONFLICT (metric_date, category)

            DO UPDATE SET
                total_orders = EXCLUDED.total_orders,
                total_quantity = EXCLUDED.total_quantity,
                gross_revenue = EXCLUDED.gross_revenue,
                total_discount = EXCLUDED.total_discount,
                net_revenue = EXCLUDED.net_revenue,
                avg_order_value = EXCLUDED.avg_order_value,
                rolling_7_day_revenue = EXCLUDED.rolling_7_day_revenue,
                cumulative_revenue = EXCLUDED.cumulative_revenue,
                category_rank = EXCLUDED.category_rank,
                created_at = CURRENT_TIMESTAMP;

        """;

        jdbcTemplate.update(sql);

        System.out.println("Business metrics calculated successfully.");
    }
}
