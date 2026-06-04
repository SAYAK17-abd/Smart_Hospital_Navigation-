# Contributing to HospitalNav

Thank you for your interest in contributing to HospitalNav! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Report issues responsibly

## How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Provide a clear description of the bug
3. Include steps to reproduce
4. Share relevant error messages or screenshots

### Suggesting Features
1. Check if the feature already exists
2. Provide a clear description of the feature
3. Explain the use case and benefits
4. Suggest implementation approach if possible

### Submitting Code

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Install development dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Make your changes** with clear, descriptive commit messages

4. **Test your changes:**
   - Ensure backend runs without errors
   - Test frontend functionality in different browsers
   - Test on mobile devices if UI changes

5. **Submit a Pull Request** with:
   - Clear description of changes
   - Reference to related issues
   - Any breaking changes noted

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run backend
python backend/app.py

# Open frontend in browser
# Visit: http://localhost:5000 or open frontend/index.html
```

## Code Standards

- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and single-purpose
- Test edge cases (empty searches, network errors, etc.)

## Questions?

Open an issue or contact the maintainers. We're here to help!
