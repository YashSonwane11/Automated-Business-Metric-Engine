export interface MetricSummary {
  metric_date: string;
  category: string;
  total_orders: number;
  total_quantity: number;
  gross_revenue: number;
  total_discount: number;
  net_revenue: number;
  avg_order_value: number;
  rolling_7_day_revenue: number;
  cumulative_revenue: number;
  category_rank: number;
  created_at: string;
}
