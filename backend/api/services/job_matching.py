"""
Job Matching Service
Matches user profiles with job opportunities and calculates scores.
"""

from typing import List, Dict, Any, Optional
from difflib import SequenceMatcher
from collections import Counter
import re


class JobMatcher:
    """Matches job profiles with job listings."""

    def __init__(self):
        self.weights = {
            'title_match': 0.25,
            'skills_match': 0.30,
            'location_match': 0.15,
            'salary_match': 0.15,
            'experience_match': 0.15,
        }

    def calculate_match_score(
        self,
        profile: Dict[str, Any],
        job: Dict[str, Any]
    ) -> tuple[float, List[str]]:
        """
        Calculate match score between profile and job.
        Returns: (score 0-100, list of match reasons)
        """
        scores = {}
        reasons = []

        # Title match
        title_score = self._match_titles(
            profile.get('title', ''),
            job.get('title', '')
        )
        scores['title_match'] = title_score
        if title_score > 0.7:
            reasons.append("Ruolo compatibile")

        # Skills match
        skills_score, skill_matches = self._match_skills(
            profile.get('skills', []),
            job.get('description', '')
        )
        scores['skills_match'] = skills_score
        if skill_matches:
            reasons.append(f"{len(skill_matches)} competenze rilevanti")

        # Location match
        location_score = self._match_location(
            profile.get('locations', []),
            job.get('location', '')
        )
        scores['location_match'] = location_score
        if location_score > 0.5:
            reasons.append("Ubicazione preferita")

        # Salary match
        salary_score = self._match_salary(
            profile.get('salary_min'),
            profile.get('salary_max'),
            job.get('salary', '')
        )
        scores['salary_match'] = salary_score
        if salary_score > 0.5:
            reasons.append("Ral in linea con aspettative")

        # Experience match
        exp_score = self._match_experience(
            profile.get('seniority', ''),
            profile.get('years_experience'),
            job.get('title', ''),
            job.get('description', '')
        )
        scores['experience_match'] = exp_score
        if exp_score > 0.6:
            reasons.append("Esperienza adeguata")

        # Calculate weighted total
        total_score = sum(
            scores[key] * self.weights[key]
            for key in scores
        )

        # Normalize to 0-100
        final_score = round(total_score * 100)

        return final_score, reasons

    def _match_titles(self, profile_title: str, job_title: str) -> float:
        """Match job titles using similarity."""
        if not profile_title or not job_title:
            return 0.0

        # Normalize titles
        def normalize(title: str) -> str:
            title = title.lower()
            # Remove common suffixes/prefixes
            title = re.sub(r'\s+(senior|junior|lead|principal)\s+', ' ', title)
            return title.strip()

        norm_profile = normalize(profile_title)
        norm_job = normalize(job_title)

        # Direct substring match
        if norm_profile in norm_job or norm_job in norm_profile:
            return 0.9

        # Word overlap
        profile_words = set(norm_profile.split())
        job_words = set(norm_job.split())
        overlap = len(profile_words & job_words)
        total = len(profile_words | job_words)

        if total == 0:
            return 0.0

        return overlap / total

    def _match_skills(
        self,
        profile_skills: List[str],
        job_description: str
    ) -> tuple[float, List[str]]:
        """Match skills in job description."""
        if not profile_skills or not job_description:
            return 0.0, []

        desc_lower = job_description.lower()
        matches = []

        for skill in profile_skills:
            if skill.lower() in desc_lower:
                matches.append(skill)

        if not profile_skills:
            return 0.0, []

        score = len(matches) / len(profile_skills)
        # Boost score if multiple skills match
        if len(matches) >= 3:
            score = min(1.0, score * 1.2)

        return score, matches

    def _match_location(
        self,
        profile_locations: List[str],
        job_location: str
    ) -> float:
        """Match preferred locations."""
        if not profile_locations or not job_location:
            return 0.5  # Neutral if no preference

        job_loc_lower = job_location.lower()

        for loc in profile_locations:
            if loc.lower() in job_loc_lower:
                return 1.0

        # Check for remote work
        if 'remote' in job_loc_lower or 'remoto' in job_loc_lower:
            return 0.8

        return 0.2

    def _match_salary(
        self,
        profile_min: Optional[int],
        profile_max: Optional[int],
        job_salary: str
    ) -> float:
        """Match salary expectations."""
        if not profile_min and not profile_max:
            return 0.5  # Neutral if no preference

        # Extract salary from job description
        salary_match = re.search(r'(\d{2,3})[,.\s]*(\d{3})?', job_salary)
        if not salary_match:
            return 0.5

        job_salary_val = int(salary_match.group(1)) * 1000

        if profile_min and job_salary_val >= profile_min:
            return 0.8
        if profile_max and job_salary_val <= profile_max:
            return 0.6

        return 0.3

    def _match_experience(
        self,
        profile_seniority: str,
        profile_years: Optional[int],
        job_title: str,
        job_description: str
    ) -> float:
        """Match experience level."""
        job_text = f"{job_title} {job_description}".lower()

        seniority_indicators = {
            'junior': ['junior', 'entry level', 'trainee', '0-2 years'],
            'mid': ['mid', 'intermediate', '2-5 years'],
            'senior': ['senior', 'lead', '5+ years', '8+ years'],
            'executive': ['executive', 'director', 'vp', 'head of', 'chief'],
        }

        # Detect job seniority
        detected_seniority = None
        for level, indicators in seniority_indicators.items():
            if any(ind in job_text for ind in indicators):
                detected_seniority = level
                break

        if not detected_seniority or not profile_seniority:
            return 0.5

        seniority_order = ['junior', 'mid', 'senior', 'executive']
        profile_idx = seniority_order.index(profile_seniority) if profile_seniority in seniority_order else 1
        job_idx = seniority_order.index(detected_seniority) if detected_seniority in seniority_order else 1

        # Closer indices = better match
        diff = abs(profile_idx - job_idx)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.7
        else:
            return 0.3

    def rank_jobs(
        self,
        profile: Dict[str, Any],
        jobs: List[Dict[str, Any]],
        min_score: int = 40
    ) -> List[Dict[str, Any]]:
        """
        Rank all jobs by match score.
        Returns jobs with score >= min_score, sorted by score.
        """
        scored_jobs = []

        for job in jobs:
            score, reasons = self.calculate_match_score(profile, job)

            if score >= min_score:
                job_with_score = job.copy()
                job_with_score['match_score'] = score
                job_with_score['match_reasons'] = reasons
                scored_jobs.append(job_with_score)

        # Sort by score descending
        scored_jobs.sort(key=lambda x: x['match_score'], reverse=True)

        return scored_jobs
