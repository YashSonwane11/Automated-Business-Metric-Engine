package com.example.demo.controller;

import com.example.demo.model.BatchJobRun;
import com.example.demo.repository.BatchJobRunRepository;
import com.example.demo.service.MetricsTransformationService;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobLauncher jobLauncher;
    private final Job importSalesJob;
    private final BatchJobRunRepository jobRunRepository;
    private final MetricsTransformationService metricsTransformationService;

    public JobController(JobLauncher jobLauncher,
                         Job importSalesJob,
                         BatchJobRunRepository jobRunRepository,
                         MetricsTransformationService metricsTransformationService) {
        this.jobLauncher = jobLauncher;
        this.importSalesJob = importSalesJob;
        this.jobRunRepository = jobRunRepository;
        this.metricsTransformationService = metricsTransformationService;
    }

    @GetMapping("/recent")
    public List<BatchJobRun> getRecentJobs() {
        return jobRunRepository.findTop20ByOrderByStartedAtDesc();
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, Object>> runBatchJob() {
        BatchJobRun jobRun = new BatchJobRun();
        jobRun.setJobName("importSalesJob");
        jobRun.setStartedAt(LocalDateTime.now());
        jobRun.setStatus("QUEUED");
        jobRun.setMessage("Batch job queued");
        jobRunRepository.save(jobRun);

        try {
            JobParameters parameters = new JobParametersBuilder()
                    .addLong("timestamp", System.currentTimeMillis())
                    .toJobParameters();

            jobRun.setStatus("RUNNING");
            jobRun.setMessage("Batch job started");
            jobRunRepository.save(jobRun);

            jobLauncher.run(importSalesJob, parameters);
            metricsTransformationService.calculateBusinessMetrics();

            jobRun.setCompletedAt(LocalDateTime.now());
            jobRun.setStatus("COMPLETED");
            jobRun.setMessage("Batch job completed successfully");
            jobRun.setRowsProcessed(null);
            jobRun.setRowsFailed(null);
            jobRunRepository.save(jobRun);

            return ResponseEntity.ok(Map.of("status", "COMPLETED"));
        } catch (Exception ex) {
            jobRun.setCompletedAt(LocalDateTime.now());
            jobRun.setStatus("FAILED");
            jobRun.setMessage(ex.getMessage());
            jobRunRepository.save(jobRun);
            return ResponseEntity.status(500).body(Map.of("status", "FAILED", "message", ex.getMessage()));
        }
    }
}
