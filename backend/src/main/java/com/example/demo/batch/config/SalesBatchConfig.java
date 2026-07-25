package com.example.demo.batch.config;

import com.example.demo.batch.model.RawSalesRecord;
import com.example.demo.batch.processor.RawSalesItemProcessor;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.database.JdbcBatchItemWriter;
import org.springframework.batch.infrastructure.item.database.BeanPropertyItemSqlParameterSourceProvider;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.batch.infrastructure.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.sql.DataSource;

@Configuration
public class SalesBatchConfig {

    @Bean
    public FlatFileItemReader<RawSalesRecord> reader() {
        return new FlatFileItemReaderBuilder<RawSalesRecord>()
                .name("rawSalesReader")
                .resource(new ClassPathResource("data/raw_sales_data.csv"))
                .delimited()
                .names("orderId", "orderDate", "customerId", "customerName",
                        "category", "productName", "quantity", "unitPrice",
                        "discount", "paymentMethod", "region")
                .targetType(RawSalesRecord.class)
                .linesToSkip(1)
                .build();
    }

    @Bean
    public JdbcBatchItemWriter<RawSalesRecord> writer(DataSource dataSource) {
        JdbcBatchItemWriter<RawSalesRecord> writer = new JdbcBatchItemWriter<>();

        writer.setItemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>());
        writer.setSql("""
            INSERT INTO raw_sales_data
            (order_id, order_date, customer_id, customer_name, category,
             product_name, quantity, unit_price, discount, revenue,
             payment_method, region)
            VALUES
            (:orderId, CAST(:orderDate AS DATE), :customerId, :customerName, :category,
             :productName, CAST(:quantity AS INTEGER), CAST(:unitPrice AS NUMERIC),
             CAST(:discount AS NUMERIC),
             (CAST(:quantity AS NUMERIC) * CAST(:unitPrice AS NUMERIC)) - CAST(:discount AS NUMERIC),
             :paymentMethod, :region)
        """);
        writer.setDataSource(dataSource);

        return writer;
    }

    @Bean
    public Step importSalesStep(
            JobRepository jobRepository,
            PlatformTransactionManager transactionManager,
            FlatFileItemReader<RawSalesRecord> reader,
            RawSalesItemProcessor processor,
            JdbcBatchItemWriter<RawSalesRecord> writer
    ) {
        return new StepBuilder("importSalesStep", jobRepository)
                .<RawSalesRecord, RawSalesRecord>chunk(5, transactionManager)
                .reader(reader)
                .processor(processor::process)
                .writer(writer)
                .build();
    }

    @Bean
    public Job importSalesJob(
            JobRepository jobRepository,
            Step importSalesStep
    ) {
        return new JobBuilder("importSalesJob", jobRepository)
                .start(importSalesStep)
                .build();
    }
}