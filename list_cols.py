import json
with open('schema.json', 'r') as f:
    data = json.load(f)

def print_props(table):
    if 'definitions' in data and table in data['definitions']:
        props = data['definitions'][table].get('properties', {})
        print(f"Columns for {table}:")
        for p in sorted(props.keys()):
            print(f" - {p}")
    else:
        print(f"Table {table} not found")

print_props('services')
print_props('plans')
print_props('transactions')
