"""initial_canonical_schema

Revision ID: b7dee1a14ac3
Revises: 
Create Date: 2026-08-30 23:39:07.195220

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7dee1a14ac3'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. departments
    op.create_table(
        'departments',
        sa.Column('department_code', sa.String(length=10), nullable=False),
        sa.Column('department_name', sa.String(length=100), nullable=False),
        sa.Column('contact_officer', sa.String(length=100), nullable=True),
        sa.Column('priority_weight', sa.Float(), nullable=True, server_default='1.0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('department_code')
    )
    op.create_index('ix_departments_department_code', 'departments', ['department_code'], unique=False)

    # 2. corridors
    op.create_table(
        'corridors',
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('start_location', sa.String(length=100), nullable=False),
        sa.Column('end_location', sa.String(length=100), nullable=False),
        sa.Column('total_length_km', sa.Float(), nullable=False),
        sa.Column('track_configuration', sa.String(length=50), nullable=False, server_default='DOUBLE_LINE'),
        sa.Column('sections_json', sa.JSON(), nullable=False),
        sa.Column('operational_status', sa.String(length=50), nullable=False, server_default='NORMAL'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('corridor_id')
    )
    op.create_index('ix_corridors_corridor_id', 'corridors', ['corridor_id'], unique=False)

    # 3. track_sections
    op.create_table(
        'track_sections',
        sa.Column('section_id', sa.String(length=50), nullable=False),
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('sequence_order', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('start_location', sa.String(length=100), nullable=False),
        sa.Column('end_location', sa.String(length=100), nullable=False),
        sa.Column('distance_km', sa.Float(), nullable=False),
        sa.Column('track_configuration', sa.String(length=50), nullable=False, server_default='DOUBLE_LINE'),
        sa.Column('max_permissible_speed_kmh', sa.Integer(), nullable=False, server_default='130'),
        sa.Column('operational_status', sa.String(length=50), nullable=False, server_default='NORMAL'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['corridor_id'], ['corridors.corridor_id'], ),
        sa.PrimaryKeyConstraint('section_id')
    )
    op.create_index('ix_track_sections_section_id', 'track_sections', ['section_id'], unique=False)

    # 4. assets
    op.create_table(
        'assets',
        sa.Column('asset_id', sa.String(length=50), nullable=False),
        sa.Column('asset_name', sa.String(length=150), nullable=False),
        sa.Column('asset_type', sa.String(length=50), nullable=False),
        sa.Column('department', sa.String(length=10), nullable=False),
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('track_section_id', sa.String(length=50), nullable=False),
        sa.Column('location_km_start', sa.Float(), nullable=False),
        sa.Column('location_km_end', sa.Float(), nullable=False),
        sa.Column('criticality_index', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('condition_score', sa.Float(), nullable=False, server_default='7.0'),
        sa.Column('operational_status', sa.String(length=50), nullable=False, server_default='ACTIVE'),
        sa.Column('installation_date', sa.String(length=20), nullable=True),
        sa.Column('last_maintenance_date', sa.String(length=20), nullable=True),
        sa.Column('next_due_date', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['corridor_id'], ['corridors.corridor_id'], ),
        sa.ForeignKeyConstraint(['department'], ['departments.department_code'], ),
        sa.ForeignKeyConstraint(['track_section_id'], ['track_sections.section_id'], ),
        sa.PrimaryKeyConstraint('asset_id')
    )
    op.create_index('ix_assets_asset_id', 'assets', ['asset_id'], unique=False)

    # 5. maintenance_tasks
    op.create_table(
        'maintenance_tasks',
        sa.Column('task_id', sa.String(length=50), nullable=False),
        sa.Column('asset_id', sa.String(length=50), nullable=False),
        sa.Column('department', sa.String(length=10), nullable=False),
        sa.Column('task_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('priority_score', sa.Float(), nullable=False, server_default='5.0'),
        sa.Column('is_emergency', sa.Boolean(), nullable=True, server_default='0'),
        sa.Column('due_date', sa.String(length=20), nullable=False),
        sa.Column('estimated_duration_mins', sa.Integer(), nullable=False),
        sa.Column('minimum_duration_mins', sa.Integer(), nullable=False),
        sa.Column('maximum_duration_mins', sa.Integer(), nullable=False),
        sa.Column('required_resources', sa.JSON(), nullable=True),
        sa.Column('preferred_time_window', sa.JSON(), nullable=True),
        sa.Column('location_corridor_id', sa.String(length=50), nullable=False),
        sa.Column('location_section_id', sa.String(length=50), nullable=False),
        sa.Column('prerequisite_task_ids', sa.JSON(), nullable=True),
        sa.Column('compatible_task_types', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='REQUESTED'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.asset_id'], ),
        sa.ForeignKeyConstraint(['department'], ['departments.department_code'], ),
        sa.PrimaryKeyConstraint('task_id')
    )
    op.create_index('ix_maintenance_tasks_task_id', 'maintenance_tasks', ['task_id'], unique=False)

    # 6. train_movements
    op.create_table(
        'train_movements',
        sa.Column('train_id', sa.String(length=50), nullable=False),
        sa.Column('train_number', sa.String(length=50), nullable=False),
        sa.Column('train_name', sa.String(length=150), nullable=False),
        sa.Column('train_type', sa.String(length=50), nullable=False),
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('track_section_id', sa.String(length=50), nullable=True),
        sa.Column('direction', sa.String(length=10), nullable=False),
        sa.Column('scheduled_entry_time', sa.DateTime(), nullable=False),
        sa.Column('scheduled_exit_time', sa.DateTime(), nullable=False),
        sa.Column('priority_category', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('delay_minutes', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='SCHEDULED'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['corridor_id'], ['corridors.corridor_id'], ),
        sa.PrimaryKeyConstraint('train_id')
    )
    op.create_index('ix_train_movements_train_id', 'train_movements', ['train_id'], unique=False)

    # 7. resources
    op.create_table(
        'resources',
        sa.Column('resource_id', sa.String(length=50), nullable=False),
        sa.Column('resource_name', sa.String(length=150), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('department', sa.String(length=10), nullable=False),
        sa.Column('capability', sa.String(length=100), nullable=False),
        sa.Column('home_depot_location', sa.String(length=100), nullable=False),
        sa.Column('current_location_section_id', sa.String(length=50), nullable=False),
        sa.Column('available_from', sa.DateTime(), nullable=False),
        sa.Column('available_until', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='READY'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['department'], ['departments.department_code'], ),
        sa.PrimaryKeyConstraint('resource_id')
    )
    op.create_index('ix_resources_resource_id', 'resources', ['resource_id'], unique=False)

    # 8. block_opportunities
    op.create_table(
        'block_opportunities',
        sa.Column('opportunity_id', sa.String(length=50), nullable=False),
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('track_section_id', sa.String(length=50), nullable=False),
        sa.Column('window_start', sa.DateTime(), nullable=False),
        sa.Column('window_end', sa.DateTime(), nullable=False),
        sa.Column('maximum_duration_mins', sa.Integer(), nullable=False),
        sa.Column('availability_status', sa.String(length=50), nullable=False, server_default='AVAILABLE'),
        sa.Column('affected_line_direction', sa.String(length=10), nullable=False, server_default='BOTH'),
        sa.Column('is_power_block_available', sa.Boolean(), nullable=True, server_default='1'),
        sa.Column('restriction_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['corridor_id'], ['corridors.corridor_id'], ),
        sa.PrimaryKeyConstraint('opportunity_id')
    )
    op.create_index('ix_block_opportunities_opportunity_id', 'block_opportunities', ['opportunity_id'], unique=False)

    # 9. freight_forecasts
    op.create_table(
        'freight_forecasts',
        sa.Column('forecast_id', sa.String(length=50), nullable=False),
        sa.Column('corridor_id', sa.String(length=50), nullable=False),
        sa.Column('track_section_id', sa.String(length=50), nullable=False),
        sa.Column('window_start', sa.DateTime(), nullable=False),
        sa.Column('window_end', sa.DateTime(), nullable=False),
        sa.Column('expected_freight_density', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('confidence_level', sa.Float(), nullable=False, server_default='0.85'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['corridor_id'], ['corridors.corridor_id'], ),
        sa.PrimaryKeyConstraint('forecast_id')
    )
    op.create_index('ix_freight_forecasts_forecast_id', 'freight_forecasts', ['forecast_id'], unique=False)

    # 10. execution_records
    op.create_table(
        'execution_records',
        sa.Column('execution_id', sa.String(length=50), nullable=False),
        sa.Column('plan_id', sa.String(length=50), nullable=False),
        sa.Column('task_id', sa.String(length=50), nullable=False),
        sa.Column('planned_start', sa.DateTime(), nullable=False),
        sa.Column('planned_end', sa.DateTime(), nullable=False),
        sa.Column('actual_start', sa.DateTime(), nullable=True),
        sa.Column('actual_end', sa.DateTime(), nullable=True),
        sa.Column('delay_start_mins', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('overrun_mins', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('completion_status', sa.String(length=50), nullable=False, server_default='PENDING'),
        sa.Column('resources_utilized', sa.JSON(), nullable=True),
        sa.Column('variance_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('execution_id')
    )
    op.create_index('ix_execution_records_execution_id', 'execution_records', ['execution_id'], unique=False)

    # 11. scenario_runs
    op.create_table(
        'scenario_runs',
        sa.Column('run_id', sa.String(length=50), nullable=False),
        sa.Column('scenario_type', sa.String(length=50), nullable=False),
        sa.Column('seed', sa.Integer(), nullable=False),
        sa.Column('generated_at', sa.DateTime(), nullable=True),
        sa.Column('summary_json', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('run_id')
    )
    op.create_index('ix_scenario_runs_run_id', 'scenario_runs', ['run_id'], unique=False)


def downgrade() -> None:
    op.drop_table('scenario_runs')
    op.drop_table('execution_records')
    op.drop_table('freight_forecasts')
    op.drop_table('block_opportunities')
    op.drop_table('resources')
    op.drop_table('train_movements')
    op.drop_table('maintenance_tasks')
    op.drop_table('assets')
    op.drop_table('track_sections')
    op.drop_table('corridors')
    op.drop_table('departments')
