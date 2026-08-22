import math

class SpatialService:
    def __init__(self, grid_size: float = 0.25):
        self.grid_size = grid_size

    def compute_grid_cell(self, lat: float, lon: float) -> str:
        """
        Calculates the center coordinate bounding ID for a coordinate point.
        Example: lat=18.92, lon=72.82 -> grid_cell_id = 'G_18.875_72.875'
        """
        grid_lat = (math.floor(lat / self.grid_size) * self.grid_size) + (self.grid_size / 2)
        grid_lon = (math.floor(lon / self.grid_size) * self.grid_size) + (self.grid_size / 2)
        return f"G_{round(grid_lat, 4)}_{round(grid_lon, 4)}"

    def resolve_region(self, lat: float, lon: float) -> str:
        if 10.0 <= lat <= 25.0 and 60.0 <= lon <= 77.0:
            return "Arabian_Sea"
        return "Unknown_Region"
