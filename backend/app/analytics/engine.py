import pandas as pd
import numpy as np
from scipy import stats
from typing import Dict, Any, List

class ScientificAnalyticsEngine:
    """
    Deterministic Scientific Analytics Engine.
    Executes exact mathematical calculations using Pandas and SciPy (strictly zero LLM intervention).
    """

    @staticmethod
    def calculate_trend(timestamps: List[Any], values: List[float]) -> Dict[str, Any]:
        """
        Calculates linear regression trends, summary statistics, and percentage change.
        """
        if not values or len(values) < 2:
            return {
                "mean": 0.0,
                "median": 0.0,
                "min": 0.0,
                "max": 0.0,
                "slope": 0.0,
                "slope_per_decade": 0.0,
                "r_squared": 0.0,
                "p_value": 1.0,
                "percentage_change": 0.0
            }
        
        df = pd.DataFrame({"time": pd.to_datetime(timestamps), "val": [float(v) for v in values]})
        df = df.sort_values("time")
        
        time_seconds = (df["time"] - df["time"].min()).dt.total_seconds()
        slope, intercept, r_value, p_value, std_err = stats.linregress(time_seconds, df["val"])
        
        mean_val = df["val"].mean()
        median_val = df["val"].median()
        min_val = df["val"].min()
        max_val = df["val"].max()
        
        pct_change = 0.0
        if df["val"].iloc[0] != 0:
            pct_change = ((df["val"].iloc[-1] - df["val"].iloc[0]) / df["val"].iloc[0]) * 100.0

        return {
            "mean": float(round(mean_val, 4)),
            "median": float(round(median_val, 4)),
            "min": float(round(min_val, 4)),
            "max": float(round(max_val, 4)),
            "slope": float(slope),
            "slope_per_decade": float(slope * 86400 * 365.25 * 10),
            "r_squared": float(round(r_value ** 2, 4)),
            "p_value": float(round(p_value, 6)),
            "percentage_change": float(round(pct_change, 2))
        }

    @staticmethod
    def calculate_correlation(values_x: List[float], values_y: List[float]) -> Dict[str, Any]:
        """
        Calculates Pearson linear and Spearman rank-order correlations.
        """
        if len(values_x) != len(values_y) or len(values_x) < 3:
            return {
                "pearson": {"r": 0.0, "p": 1.0},
                "spearman": {"r": 0.0, "p": 1.0},
                "sample_count": len(values_x)
            }
            
        x_arr = np.array(values_x, dtype=float)
        y_arr = np.array(values_y, dtype=float)

        pearson_r, pearson_p = stats.pearsonr(x_arr, y_arr)
        spearman_r, spearman_p = stats.spearmanr(x_arr, y_arr)
        
        return {
            "pearson": {"r": float(round(pearson_r, 4)), "p": float(round(pearson_p, 6))},
            "spearman": {"r": float(round(spearman_r, 4)), "p": float(round(spearman_p, 6))},
            "sample_count": len(values_x)
        }

    @staticmethod
    def detect_anomalies(values: List[float], timestamps: List[Any], window: int = 6, threshold: float = 2.0) -> List[Dict[str, Any]]:
        """
        Calculates rolling baselines and identifies statistical anomalies using z-score thresholding.
        """
        if len(values) < window:
            return []
            
        df = pd.DataFrame({"time": pd.to_datetime(timestamps), "val": [float(v) for v in values]}).sort_values("time")
        
        # Calculate rolling baseline over prior window
        df["rolling_mean"] = df["val"].shift(1).rolling(window=window, min_periods=3).mean()
        df["rolling_std"] = df["val"].shift(1).rolling(window=window, min_periods=3).std().fillna(0.001).clip(lower=0.001)
        df["z_score"] = (df["val"] - df["rolling_mean"]) / df["rolling_std"]
        
        anomalies = df[df["z_score"].abs() >= threshold]
        
        results = []
        for idx, row in anomalies.iterrows():
            results.append({
                "timestamp": row["time"].isoformat(),
                "observed_value": float(round(row["val"], 4)),
                "expected_mean": float(round(row["rolling_mean"], 4)),
                "z_score": float(round(row["z_score"], 4)),
                "classification": "high" if row["z_score"] > 0 else "low"
            })
        return results
