# Health Intelligence Dashboard

Configurable health intelligence dashboard with drag-and-drop widgets, real-time data feeds, and export capabilities.

## Architecture

```
health-intelligence-dashboard/
  src/           # Core modules
  tests/         # Unit and integration tests
  config/        # Configuration files
  docs/          # Documentation
```

## Modules

- **widget_factory**: Core widget factory functionality
- **chart_builder**: Core chart builder functionality
- **filter_engine**: Core filter engine functionality
- **layout_manager**: Core layout manager functionality
- **export_handler**: Core export handler functionality

## Quick Start

```bash
pip install -r requirements.txt
python -m health_intelligence_dashboard.main
```

## Testing

```bash
pytest tests/ -v
```

## License

MIT License - see LICENSE for details.
