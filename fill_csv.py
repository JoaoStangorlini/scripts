import csv
import sys

input_file = os.environ.get('INPUT_CSV', './data_safety_export.csv')
output_file = os.environ.get('OUTPUT_CSV', './data_safety_export_filled.csv')

# Define the exact data types we are collecting
collected_data_types = [
    'PSL_NAME', 'PSL_EMAIL', 'PSL_USER_ACCOUNT',
    'PSL_OTHER_MESSAGES',
    'PSL_PHOTOS', 'PSL_VIDEOS',
    'PSL_OTHER_AUDIO',
    'PSL_FILES_AND_DOCS',
    'PSL_CRASH_LOGS', 'PSL_PERFORMANCE_DIAGNOSTICS', 'PSL_OTHER_PERFORMANCE',
    'PSL_USER_INTERACTION', 'PSL_USER_GENERATED_CONTENT', 'PSL_OTHER_APP_ACTIVITY',
    'PSL_DEVICE_ID'
]

# Define which ones are required vs optional
required_data_types = ['PSL_NAME', 'PSL_EMAIL', 'PSL_USER_ACCOUNT']

def is_collected(q_id, r_id):
    if q_id.startswith('PSL_DATA_TYPES_'):
        return r_id in collected_data_types
    return None

def process_row(row):
    q_id = row[0]
    r_id = row[1]
    
    # 1. Global settings
    if q_id == 'PSL_DATA_COLLECTION_COLLECTS_PERSONAL_DATA':
        row[2] = 'true'
    elif q_id == 'PSL_DATA_COLLECTION_ENCRYPTED_IN_TRANSIT':
        row[2] = 'true'
    elif q_id == 'PSL_ACCOUNT_DELETION_URL':
        row[2] = 'https://hub-lab-div.vercel.app/conta'
    elif q_id == 'PSL_DATA_DELETION_URL':
        row[2] = 'https://hub-lab-div.vercel.app/conta'
    elif q_id == 'PSL_SUPPORT_DATA_DELETION_BY_USER':
        if r_id == 'DATA_DELETION_YES':
            row[2] = 'true'
        else:
            row[2] = ''
            
    # 2. Data Types Selection
    elif q_id.startswith('PSL_DATA_TYPES_'):
        if r_id in collected_data_types:
            row[2] = 'true'
        else:
            row[2] = ''
            
    # 3. Data Usage Details for specific data types
    elif q_id.startswith('PSL_DATA_USAGE_RESPONSES:'):
        parts = q_id.split(':')
        dtype = parts[1]
        usage_type = parts[2] if len(parts) > 2 else ''
        
        # If this data type is NOT collected, empty everything
        if dtype not in collected_data_types:
            row[2] = ''
            return row
            
        # If it IS collected:
        if usage_type == 'PSL_DATA_USAGE_COLLECTION_AND_SHARING':
            if r_id == 'PSL_DATA_USAGE_ONLY_COLLECTED':
                row[2] = 'true'
            else:
                row[2] = ''
        elif usage_type == 'PSL_DATA_USAGE_EPHEMERAL':
            row[2] = 'false'
        elif usage_type == 'DATA_USAGE_USER_CONTROL':
            is_req = dtype in required_data_types
            if r_id == 'PSL_DATA_USAGE_USER_CONTROL_REQUIRED':
                row[2] = 'true' if is_req else ''
            elif r_id == 'PSL_DATA_USAGE_USER_CONTROL_OPTIONAL':
                row[2] = '' if is_req else 'true'
        elif usage_type == 'DATA_USAGE_COLLECTION_PURPOSE':
            # Base purposes: App Functionality, Account Management
            purposes = ['PSL_APP_FUNCTIONALITY', 'PSL_ACCOUNT_MANAGEMENT']
            # Analytics for logs/activity
            if dtype in ['PSL_CRASH_LOGS', 'PSL_PERFORMANCE_DIAGNOSTICS', 'PSL_OTHER_PERFORMANCE', 'PSL_USER_INTERACTION', 'PSL_USER_GENERATED_CONTENT', 'PSL_OTHER_APP_ACTIVITY', 'PSL_DEVICE_ID']:
                purposes.append('PSL_ANALYTICS')
            # Developer Comms for email
            if dtype == 'PSL_EMAIL':
                purposes.append('PSL_DEVELOPER_COMMUNICATIONS')
            # Personalization for UGC/Interaction
            if dtype in ['PSL_USER_INTERACTION', 'PSL_USER_GENERATED_CONTENT']:
                purposes.append('PSL_PERSONALIZATION')
                
            if r_id in purposes:
                row[2] = 'true'
            else:
                row[2] = ''
        elif usage_type == 'DATA_USAGE_SHARING_PURPOSE':
            # We don't share
            row[2] = ''

    return row

try:
    with open(input_file, mode='r', encoding='utf-8') as infile:
        reader = csv.reader(infile)
        rows = list(reader)
        
    # The first row is the header
    header = rows[0]
    data_rows = rows[1:]
    
    processed_rows = [header]
    for row in data_rows:
        processed_rows.append(process_row(row))
        
    with open(output_file, mode='w', encoding='utf-8', newline='') as outfile:
        writer = csv.writer(outfile)
        writer.writerows(processed_rows)
        
    print(f"Successfully generated {output_file}")
except Exception as e:
    print(f"Error: {e}")
