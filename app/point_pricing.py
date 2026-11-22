"""Shared point face value and bounded, explicitly quoted supplier-data escrow."""
POINTS_PER_CNY=100
DATA_BUDGETS={'buyer_search':1500,'buyer_profile':1000,'buyer_contacts':500,'customs_verification':1500,
              'directory_companies':1500,'directory_people':1500,'directory_contacts':500,'trade_search':1500}


def points_for_milli(value):
    return (value*POINTS_PER_CNY+999)//1000


def quote(settings,operation,payload=None):
    payload=payload or {}
    budget=DATA_BUDGETS.get(operation,0)
    if operation=='targeted_contacts':budget=2*settings.hunter_contact_estimate_milli_cny
    if operation=='prospecting' and payload.get('acquisition_tier')=='ai_enhanced':budget=7000
    if operation=='prospecting' and payload.get('acquisition_tier')=='enhanced':budget=6000
    base=settings.point_cost(operation)
    data=points_for_milli(budget)
    return {'platform_points':base,'data_points':data,'total_points':base+data,
        'data_budget_milli_cny':budget,'points_per_cny':POINTS_PER_CNY,
        'data_settlement':'reported_supplier_cost_capped_at_reserved_points'}
