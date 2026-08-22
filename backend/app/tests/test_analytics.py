import pytest
from app.analytics.engine import ScientificAnalyticsEngine

def test_hand_calculated_linear_trend():
    """
    Hand-calculated benchmark test:
    Values: [10.0, 12.0, 14.0, 16.0, 18.0]
    Hand Calculations:
      - Mean: (10 + 12 + 14 + 16 + 18) / 5 = 14.0
      - Min: 10.0, Max: 18.0
      - Percentage Change: ((18.0 - 10.0) / 10.0) * 100 = 80.0%
      - R-squared: Perfect linear line -> 1.0
    """
    timestamps = [
        "2021-01-01T00:00:00Z",
        "2022-01-01T00:00:00Z",
        "2023-01-01T00:00:00Z",
        "2024-01-01T00:00:00Z",
        "2025-01-01T00:00:00Z"
    ]
    values = [10.0, 12.0, 14.0, 16.0, 18.0]
    
    stats = ScientificAnalyticsEngine.calculate_trend(timestamps, values)
    
    assert stats["mean"] == 14.0
    assert stats["median"] == 14.0
    assert stats["min"] == 10.0
    assert stats["max"] == 18.0
    assert stats["percentage_change"] == 80.0
    assert stats["r_squared"] == 1.0
    assert stats["slope"] > 0

def test_hand_calculated_pearson_spearman_correlation():
    """
    Hand-calculated benchmark test:
    Inverse linear vectors:
      X = [1.0, 2.0, 3.0, 4.0, 5.0]
      Y = [10.0, 8.0, 6.0, 4.0, 2.0]
    Hand Calculations:
      - Pearson r must be exactly -1.0
      - Spearman r must be exactly -1.0
    """
    values_x = [1.0, 2.0, 3.0, 4.0, 5.0]
    values_y = [10.0, 8.0, 6.0, 4.0, 2.0]
    
    res = ScientificAnalyticsEngine.calculate_correlation(values_x, values_y)
    
    assert res["pearson"]["r"] == -1.0
    assert res["spearman"]["r"] == -1.0
    assert res["sample_count"] == 5

def test_hand_calculated_zscore_anomaly_detection():
    """
    Hand-calculated benchmark test:
    Baseline: 5 measurements of 20.0 (mean = 20.0, std = 0.0)
    Spike at position 6: 30.0
    Hand Calculations:
      - Rolling mean prior window: 20.0
      - Position 6 observed value: 30.0
      - Expected anomaly classification: 'high'
    """
    timestamps = [f"2021-{m:02d}-01T00:00:00Z" for m in range(1, 7)]
    values = [20.0, 20.0, 20.0, 20.0, 20.0, 30.0]
    
    anomalies = ScientificAnalyticsEngine.detect_anomalies(values, timestamps, window=5, threshold=2.0)
    
    assert len(anomalies) == 1
    assert anomalies[0]["observed_value"] == 30.0
    assert anomalies[0]["expected_mean"] == 20.0
    assert anomalies[0]["classification"] == "high"
