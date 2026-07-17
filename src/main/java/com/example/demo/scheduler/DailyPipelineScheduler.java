package com.example.demo.scheduler;

import com.example.demo.service.MetricsTransformationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyPipelineScheduler {

    private final MetricsTransformationService metricsTransformationService;

    public DailyPipelineScheduler(MetricsTransformationService metricsTransformationService) {
        this.metricsTransformationService = metricsTransformationService;
    }

    // Runs every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void runDailyMetricsJob() {
        System.out.println("Daily metrics scheduler started...");
        metricsTransformationService.calculateBusinessMetrics();
        System.out.println("Daily metrics scheduler completed.");
    }
}
