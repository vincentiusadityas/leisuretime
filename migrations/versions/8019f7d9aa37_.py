"""empty message

Revision ID: 8019f7d9aa37
Revises: 
Create Date: 2021-01-10 16:55:16.382544

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8019f7d9aa37'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('activity', sa.Column('tvshow_id', sa.Integer(), nullable=True))
    op.add_column('activity', sa.Column('tvshow_img_src', sa.String(length=200), nullable=True))
    op.add_column('activity', sa.Column('tvshow_rating', sa.String(length=100), nullable=True))
    op.add_column('activity', sa.Column('tvshow_release_date', sa.String(length=100), nullable=True))
    op.add_column('activity', sa.Column('tvshow_title', sa.String(length=100), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('activity', 'tvshow_title')
    op.drop_column('activity', 'tvshow_release_date')
    op.drop_column('activity', 'tvshow_rating')
    op.drop_column('activity', 'tvshow_img_src')
    op.drop_column('activity', 'tvshow_id')
    # ### end Alembic commands ###
