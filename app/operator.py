"""Server-local account provisioning and ledger-backed topups; no public admin API."""
import argparse
from getpass import getpass
from hashlib import sha256
import json

from sqlalchemy import select

from app.auth import hash_password, normalize_phone
from app.config import Settings
from app.db import PointEntry, User, Wallet, Workspace, create_session_factory, write_transaction
from app.workspaces import lock_workspace
from app.billing import fulfill_order


def provision(sessions, phone, password, initial_points=1000):
    phone = normalize_phone(phone)
    if not 8 <= len(password) <= 128 or not 0 <= initial_points <= 1000000:
        raise ValueError('Password must have 8–128 characters; initial points must be 0–1000000')
    with write_transaction(sessions) as session:
        existing = session.scalar(select(User).where(User.phone == phone))
        if existing:
            raise ValueError('Account already exists; no credentials or balance changed')
        user = User(phone=phone, password_hash=hash_password(password))
        session.add(user)
        session.flush()
        workspace = Workspace(owner_id=user.id)
        session.add(workspace)
        session.flush()
        session.add(Wallet(workspace_id=workspace.id, available=initial_points))
        session.add(PointEntry(workspace_id=workspace.id, reference=user.id, kind='grant', points=initial_points))
        return {'user_id': user.id, 'workspace_id': workspace.id, 'granted_points': initial_points}


def topup(sessions, workspace, points, receipt):
    if type(points) is not int or not 1 <= points <= 1000000 or not 1 <= len(receipt) <= 200:
        raise ValueError('Points must be 1–1000000 and receipt must have 1–200 characters')
    reference = sha256(('operator-topup:' + receipt).encode()).hexdigest()[:32]
    with write_transaction(sessions) as session:
        if session.get(Workspace, workspace) is None:
            raise ValueError('Workspace not found')
        lock_workspace(session, workspace)
        previous = session.scalar(select(PointEntry).where(PointEntry.workspace_id == workspace,
            PointEntry.reference == reference, PointEntry.kind == 'topup'))
        if previous:
            if previous.points != points:
                raise ValueError('Receipt already used with a different amount')
            return {'workspace_id': workspace, 'points': points, 'replayed': True}
        wallet = session.get(Wallet, workspace)
        wallet.available += points
        session.add(PointEntry(workspace_id=workspace, reference=reference, kind='topup', points=points))
        return {'workspace_id': workspace, 'points': points, 'replayed': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    account = sub.add_parser('provision', help='Open a private-beta account without buying SMS')
    account.add_argument('--phone', required=True)
    account.add_argument('--initial-points', type=int, default=1000)
    recharge = sub.add_parser('topup', help='Credit confirmed offline payment or an explicit promotional grant')
    recharge.add_argument('--workspace', required=True)
    recharge.add_argument('--points', type=int, required=True)
    recharge.add_argument('--receipt', required=True, help='Unique receipt/reference; retries are idempotent')
    settlement=sub.add_parser('settle-order',help='Fulfill an order only after independently verifying actual payment')
    settlement.add_argument('--workspace',required=True)
    settlement.add_argument('--order',required=True)
    settlement.add_argument('--amount-fen',required=True,type=int)
    settlement.add_argument('--receipt',required=True)
    args = parser.parse_args()
    settings = Settings.from_env()
    if not settings.database_url:
        parser.error('DATABASE_URL is required; inject the same environment as the service')
    sessions = create_session_factory(settings.database_url)
    try:
        if args.command == 'provision':
            password = getpass('Initial password (not echoed): ')
            if password != getpass('Repeat password: '):
                parser.error('Passwords do not match')
            result = provision(sessions, args.phone, password, args.initial_points)
        elif args.command=='topup':
            result = topup(sessions, args.workspace, args.points, args.receipt)
        else:
            result=fulfill_order(sessions,args.workspace,args.order,args.amount_fen,args.receipt)
        print(json.dumps(result, ensure_ascii=False))
    except ValueError as error:
        parser.error(str(error))
    finally:
        sessions.kw['bind'].dispose()


if __name__ == '__main__':
    main()
