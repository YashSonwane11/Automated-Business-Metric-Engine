package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "batch_job_run")
public class BatchJobRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_name", nullable = false)
    private String jobName;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "message")
    private String message;

    @Column(name = "rows_processed")
    private Integer rowsProcessed;

    @Column(name = "rows_failed")
    private Integer rowsFailed;

    public BatchJobRun() {
    }

    public BatchJobRun(String jobName, LocalDateTime startedAt, String status, String message, Integer rowsProcessed, Integer rowsFailed) {
        this.jobName = jobName;
        this.startedAt = startedAt;
        this.status = status;
        this.message = message;
        this.rowsProcessed = rowsProcessed;
        this.rowsFailed = rowsFailed;
    }

    public Long getId() {
        return id;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getRowsProcessed() {
        return rowsProcessed;
    }

    public void setRowsProcessed(Integer rowsProcessed) {
        this.rowsProcessed = rowsProcessed;
    }

    public Integer getRowsFailed() {
        return rowsFailed;
    }

    public void setRowsFailed(Integer rowsFailed) {
        this.rowsFailed = rowsFailed;
    }
}
