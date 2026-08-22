from abc import ABC, abstractmethod
from typing import Generator, Dict, Any

class DatasetConnector(ABC):
    def __init__(self, dataset_id: str, db_session):
        self.dataset_id = dataset_id
        self.db = db_session

    @abstractmethod
    def download(self, config: Dict[str, Any]) -> str:
        """
        Downloads raw source files to local disk storage path.
        Returns the absolute filepath to local file snapshot.
        """
        pass

    @abstractmethod
    def validate(self, filepath: str) -> bool:
        """
        Validates schema compliance and formatting of source file.
        """
        pass

    @abstractmethod
    def transform(self, filepath: str) -> Generator[Dict[str, Any], None, None]:
        """
        Streamingly parses and transforms raw source records into the Unified Observation Model.
        """
        pass

    @abstractmethod
    def load(self, records: Generator[Dict[str, Any], None, None]) -> Dict[str, Any]:
        """
        Batch loads records into database tables and returns execution summary report.
        """
        pass
