package com.example.demo.runner;

import com.example.demo.service.MetricsTransformationService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class MetricsRunner implements CommandLineRunner {

    private final MetricsTransformationService metricsTransformationService;

    public MetricsRunner(MetricsTransformationService metricsTransformationService) {
        this.metricsTransformationService = metricsTransformationService;
    }

    @Override
    public void run(String... args) {
        try {
            metricsTransformationService.calculateBusinessMetrics();
        } catch (Exception e) {
            System.out.println("Metrics calculation skipped on startup (no data yet): " + e.getMessage());
        }
    }
}
