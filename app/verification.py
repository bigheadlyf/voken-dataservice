from dataclasses import dataclass
from hmac import compare_digest
from secrets import token_urlsafe
from threading import Lock
from time import monotonic
from typing import Protocol


@dataclass(frozen=True)
class IssuedChallenge:
    challenge_id: str
    expires_in_seconds: int


class VerificationProvider(Protocol):
    def request(self, phone: str) -> IssuedChallenge: ...

    def verify(self, phone: str, challenge_id: str, code: str) -> bool: ...


@dataclass
class _Challenge:
    phone: str
    expires_at: float
    attempts_left: int


class FixedCodeVerificationProvider:
    """In-memory registration verification for the single-process test environment."""

    def __init__(self) -> None:
        self._challenges: dict[str, _Challenge] = {}
        self._lock = Lock()

    def request(self, phone: str) -> IssuedChallenge:
        challenge_id = token_urlsafe(24)
        expires_in_seconds = 300
        with self._lock:
            now = monotonic()
            self._challenges = {
                key: challenge
                for key, challenge in self._challenges.items()
                if challenge.expires_at > now and challenge.phone != phone
            }
            self._challenges[challenge_id] = _Challenge(phone, now + expires_in_seconds, 5)
        return IssuedChallenge(challenge_id, expires_in_seconds)

    def verify(self, phone: str, challenge_id: str, code: str) -> bool:
        with self._lock:
            challenge = self._challenges.get(challenge_id)
            if challenge is None or challenge.phone != phone:
                return False
            if challenge.expires_at <= monotonic():
                del self._challenges[challenge_id]
                return False

            matches = code.isascii() and compare_digest(code, '123456')
            challenge.attempts_left -= 1
            if matches or challenge.attempts_left == 0:
                del self._challenges[challenge_id]
            return matches
