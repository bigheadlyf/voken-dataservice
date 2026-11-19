from io import StringIO
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from alembic import command
from alembic.autogenerate import compare_metadata
from alembic.config import Config
from alembic.migration import MigrationContext

from app.db import Base, create_session_factory


class MigrationTest(TestCase):
    def test_upgrade_matches_models_and_can_be_reapplied(self):
        with TemporaryDirectory() as directory:
            url = 'sqlite:///' + Path(directory, 'migration.sqlite').as_posix()
            with patch.dict(os.environ, {'APP_ENV': 'test', 'DATABASE_URL': url}):
                config = Config('alembic.ini')
                command.upgrade(config, 'head')
                sessions = create_session_factory(url)
                try:
                    with sessions.kw['bind'].connect() as connection:
                        differences = compare_metadata(MigrationContext.configure(connection), Base.metadata)
                        self.assertEqual(differences, [])
                finally:
                    sessions.kw['bind'].dispose()
                command.downgrade(config, '0003')
                command.upgrade(config, 'head')
        output = StringIO()
        with patch.dict(os.environ, {'APP_ENV': 'production',
                'DATABASE_URL': 'mysql+pymysql://test:test@localhost/test?charset=utf8mb4'}):
            command.upgrade(Config('alembic.ini', output_buffer=output), '0003:head', sql=True)
        self.assertIn('CREATE TABLE agent_graph_checkpoints', output.getvalue())
        self.assertIn('CREATE TABLE agent_memories', output.getvalue())
