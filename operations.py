import pandas as pd
df=pd.read_csv('orders.csv')

#Selection Options
def select_columns(df, columns):
    return df[columns].values.tolist()

def select_rows_by_id(order_id):
    return df[df['order_id'] == order_id]

def filter_by_condition(columns,value):
    return df[df[columns]==value]

def filter_by_range(columns, min_value, max_value):
    return df[(df[columns] >= min_value) & (df[columns] <= max_value)]

# Structure operations
def row_count():
    return len(df)

def column_count():
    return len(df.columns)

def get_columns():
    return list(df.columns)

def remove_duplicates(col_name):
    return df.drop_duplicates(subset=[col_name])

def find_duplicates(col_name):
    return df[df.duplicated(subset=[col_name], keep=False)].sort_values(col_name)

def get_first_n_rows(n):
    return df.head(n)

def get_last_n_rows(n):
    return df.tail(n)

#sorting Operations
def sort_by_column(col_name, ascending=True):
    return df.sort_values(col_name, ascending=ascending)

def sort_by_multiple(columns, ascending=True):
    return df.sort_values(columns, ascending=ascending)

def sort_by_order_amount_desc():
    return df.sort_values('order_amount', ascending=False)

# Aggregation operations
def get_min(col_name):
    return df[col_name].min()

def get_max(col_name):
    return df[col_name].max()

def get_average(col_name):
    return round(df[col_name].mean(), 2)

def get_sum(col_name):
    return round(df[col_name].sum(), 2)

def get_count(col_name):
    return df[col_name].count()

def get_statistics(col_name):
    return df[col_name].describe()

# Lookup operations
def index_match(lookup_value, search_col, return_col):
    result = df[df[search_col] == lookup_value][return_col]
    return result.tolist() if len(result) > 0 else []

def vlookup(order_id, return_col):
    result = df[df['order_id'] == order_id][return_col]
    return result.values[0] if len(result) > 0 else "Not found"

def get_unique_values(col_name):
    return df[col_name].unique().tolist()

# Group-by / pivot operations
def group_by_aggregate(group_col, agg_col, agg_type='sum'):
    if agg_type == 'sum':
        return df.groupby(group_col)[agg_col].sum()
    elif agg_type == 'count':
        return df.groupby(group_col)[agg_col].count()
    elif agg_type == 'avg':
        return df.groupby(group_col)[agg_col].mean().round(2)
    elif agg_type == 'max':
        return df.groupby(group_col)[agg_col].max()
    elif agg_type == 'min':
        return df.groupby(group_col)[agg_col].min()
    else:
        return "Invalid agg_type"

def pivot_table(index_col, agg_col, agg_func='sum'):
    return pd.pivot_table(df, values=agg_col, index=index_col, aggfunc=agg_func)

