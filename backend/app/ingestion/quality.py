from dataclasses import dataclass, field
from typing import Dict, Any, List

@dataclass
class DataQualityReport:
    dataset_id: str
    total_rows_processed: int = 0
    valid_records: int = 0
    invalid_coordinates: int = 0
    invalid_timestamps: int = 0
    unknown_taxa: int = 0
    duplicate_records: int = 0
    missing_values: int = 0
    errors: List[str] = field(default_factory=list)

    def log_valid(self):
        self.total_rows_processed += 1
        self.valid_records += 1

    def log_invalid_coord(self, reason: str = ""):
        self.total_rows_processed += 1
        self.invalid_coordinates += 1
        if reason:
            self.errors.append(f"Invalid Coordinate: {reason}")

    def log_invalid_time(self, reason: str = ""):
        self.total_rows_processed += 1
        self.invalid_timestamps += 1
        if reason:
            self.errors.append(f"Invalid Timestamp: {reason}")

    def log_unknown_taxa(self, taxon: str = ""):
        self.total_rows_processed += 1
        self.unknown_taxa += 1
        if taxon:
            self.errors.append(f"Unknown Taxon: {taxon}")

    def log_duplicate(self):
        self.total_rows_processed += 1
        self.duplicate_records += 1

    def summary(self) -> Dict[str, Any]:
        success_rate = (self.valid_records / self.total_rows_processed * 100.0) if self.total_rows_processed > 0 else 100.0
        return {
            "dataset_id": self.dataset_id,
            "total_rows_processed": self.total_rows_processed,
            "valid_records": self.valid_records,
            "invalid_coordinates": self.invalid_coordinates,
            "invalid_timestamps": self.invalid_timestamps,
            "unknown_taxa": self.unknown_taxa,
            "duplicate_records": self.duplicate_records,
            "missing_values": self.missing_values,
            "success_rate_pct": round(success_rate, 2),
            "sample_errors": self.errors[:5]
        }

    def print_audit_report(self):
        s = self.summary()
        print(f"\n--- Data Quality Audit Report: [{s['dataset_id'].upper()}] ---")
        print(f"  - Total Rows Processed: {s['total_rows_processed']}")
        print(f"  - Valid Records:        {s['valid_records']}")
        print(f"  - Invalid Coordinates:  {s['invalid_coordinates']}")
        print(f"  - Invalid Timestamps:   {s['invalid_timestamps']}")
        print(f"  - Unknown Taxa:         {s['unknown_taxa']}")
        print(f"  - Duplicate Records:    {s['duplicate_records']}")
        print(f"  - Ingestion Quality:    {s['success_rate_pct']}%")
