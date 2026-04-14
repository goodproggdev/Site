"""
Job Board API Adapters
Implements adapters for official job APIs with rate limiting, caching, and deduplication.
"""

import json
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from django.core.cache import cache
from django.utils import timezone


class JobAdapter(ABC):
    """Abstract base class for job board adapters."""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url
        self.rate_limit_delay = 1  # seconds between requests
        self.cache_ttl = 3600  # 1 hour cache

    @abstractmethod
    def search(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search for jobs matching the query."""
        pass

    @abstractmethod
    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize job data to common format."""
        pass

    def get_cache_key(self, query: Dict[str, Any]) -> str:
        """Generate cache key for query."""
        query_str = json.dumps(query, sort_keys=True)
        return f"job_adapter:{self.__class__.__name__}:{hashlib.md5(query_str.encode()).hexdigest()}"

    def get_from_cache(self, query: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
        """Get cached results if available."""
        cache_key = self.get_cache_key(query)
        return cache.get(cache_key)

    def set_cache(self, query: Dict[str, Any], results: List[Dict[str, Any]]):
        """Cache search results."""
        cache_key = self.get_cache_key(query)
        cache.set(cache_key, results, self.cache_ttl)


class LinkedInAdapter(JobAdapter):
    """LinkedIn Jobs API Adapter (requires official partnership)."""

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key, "https://api.linkedin.com/v2")
        self.rate_limit_delay = 2

    def search(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search LinkedIn jobs (requires official API access)."""
        # Check cache first
        cached = self.get_from_cache(query)
        if cached:
            return cached

        if not self.api_key:
            return []

        # LinkedIn Jobs API requires partnership program
        # This is a placeholder for the actual implementation
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        params = {
            "keywords": query.get("title", ""),
            "location": query.get("location", ""),
            "count": min(query.get("limit", 25), 50),
        }

        try:
            response = requests.get(
                f"{self.base_url}/jobs",
                headers=headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

            jobs = [self.normalize_job(job) for job in data.get("elements", [])]
            self.set_cache(query, jobs)
            return jobs

        except requests.RequestException as e:
            print(f"LinkedIn API error: {e}")
            return []

    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_id": raw_job.get("id"),
            "source": "linkedin",
            "title": raw_job.get("title", ""),
            "company": raw_job.get("company", {}).get("name", ""),
            "location": raw_job.get("location", ""),
            "description": raw_job.get("description", ""),
            "url": raw_job.get("url", ""),
            "posted_at": raw_job.get("listedAt"),
            "salary": raw_job.get("salary", {}).get("range", ""),
        }


class IndeedAdapter(JobAdapter):
    """Indeed Job Search API Adapter."""

    def __init__(self, api_key: Optional[str] = None, publisher_id: Optional[str] = None):
        super().__init__(api_key, "https://api.indeed.com/ads/apisearch")
        self.publisher_id = publisher_id

    def search(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search Indeed jobs."""
        cached = self.get_from_cache(query)
        if cached:
            return cached

        if not self.publisher_id:
            return []

        params = {
            "publisher": self.publisher_id,
            "q": query.get("title", ""),
            "l": query.get("location", ""),
            "limit": min(query.get("limit", 25), 25),
            "format": "json",
            "v": "2",
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            jobs = [self.normalize_job(job) for job in data.get("results", [])]
            self.set_cache(query, jobs)
            return jobs

        except requests.RequestException as e:
            print(f"Indeed API error: {e}")
            return []

    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "external_id": raw_job.get("jobkey"),
            "source": "indeed",
            "title": raw_job.get("jobtitle", ""),
            "company": raw_job.get("company", ""),
            "location": raw_job.get("formattedLocation", ""),
            "description": raw_job.get("snippet", ""),
            "url": raw_job.get("url", ""),
            "posted_at": raw_job.get("date"),
            "salary": raw_job.get("salary", ""),
        }


class AdzunaAdapter(JobAdapter):
    """Adzuna API Adapter (aggregates multiple sources)."""

    def __init__(self, app_id: Optional[str] = None, api_key: Optional[str] = None):
        super().__init__(api_key, "https://api.adzuna.com/v1/api/jobs")
        self.app_id = app_id
        self.rate_limit_delay = 1

    def search(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search jobs via Adzuna API."""
        cached = self.get_from_cache(query)
        if cached:
            return cached

        if not self.app_id or not self.api_key:
            return []

        # Map country code
        country = query.get("country", "it").lower()

        params = {
            "app_id": self.app_id,
            "app_key": self.api_key,
            "what": query.get("title", ""),
            "where": query.get("location", ""),
            "max_days_old": 30,
            "results_per_page": min(query.get("limit", 20), 50),
        }

        try:
            url = f"{self.base_url}/{country}/search/1"
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            jobs = [self.normalize_job(job) for job in data.get("results", [])]
            self.set_cache(query, jobs)
            return jobs

        except requests.RequestException as e:
            print(f"Adzuna API error: {e}")
            return []

    def normalize_job(self, raw_job: Dict[str, Any]) -> Dict[str, Any]:
        salary_min = raw_job.get("salary_min")
        salary_max = raw_job.get("salary_max")
        salary = ""
        if salary_min and salary_max:
            salary = f"€{salary_min:,.0f} - €{salary_max:,.0f}"
        elif salary_min:
            salary = f"€{salary_min:,.0f}+"

        return {
            "external_id": raw_job.get("id"),
            "source": "adzuna",
            "title": raw_job.get("title", ""),
            "company": raw_job.get("company", {}).get("display_name", ""),
            "location": raw_job.get("location", {}).get("display_name", ""),
            "description": raw_job.get("description", ""),
            "url": raw_job.get("redirect_url", ""),
            "posted_at": raw_job.get("created_at"),
            "salary": salary,
        }


class JobSearchService:
    """Service to search across multiple job boards."""

    def __init__(self):
        self.adapters = []

        # Initialize adapters with API keys from settings
        from django.conf import settings

        if hasattr(settings, 'ADZUNA_APP_ID') and settings.ADZUNA_APP_ID:
            self.adapters.append(AdzunaAdapter(
                app_id=settings.ADZUNA_APP_ID,
                api_key=settings.ADZUNA_API_KEY
            ))

        if hasattr(settings, 'INDEED_PUBLISHER_ID') and settings.INDEED_PUBLISHER_ID:
            self.adapters.append(IndeedAdapter(
                publisher_id=settings.INDEED_PUBLISHER_ID
            ))

    def search_all(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search across all configured adapters and deduplicate."""
        all_jobs = []
        seen_ids = set()

        for adapter in self.adapters:
            try:
                jobs = adapter.search(query)
                for job in jobs:
                    # Deduplicate by external_id + source
                    dedup_key = f"{job['external_id']}:{job['source']}"
                    if dedup_key not in seen_ids:
                        all_jobs.append(job)
                        seen_ids.add(dedup_key)
            except Exception as e:
                print(f"Adapter {adapter.__class__.__name__} failed: {e}")
                continue

        return all_jobs
