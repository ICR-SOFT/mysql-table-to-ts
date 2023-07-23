// MySQL to TypeScript type mapping
const typeMapping: { [key: string]: string } = {
    'int': 'number',
    'integer': 'number',
    'tinyint': 'number',
    'smallint': 'number',
    'mediumint': 'number',
    'bigint': 'number',
    'float': 'number',
    'double': 'number',
    'decimal': 'number',
    'date': 'Date',
    'datetime': 'Date',
    'timestamp': 'Date',
    'time': 'Date',
    'year': 'Date',
    'char': 'string',
    'varchar': 'string',
    'blob': 'string',
    'text': 'string',
    'tinyblob': 'string',
    'tinytext': 'string',
    'mediumblob': 'string',
    'mediumtext': 'string',
    'longblob': 'string',
    'longtext': 'string',
    'enum': 'string',
    'set': 'string',
    'binary': 'string',
    'varbinary': 'string',
    'bit': 'boolean',
};

export default function mapType(mysqlType: string): string {
    const type = typeMapping[mysqlType];
    if (!type) {
        throw new Error(`Type '${mysqlType}' is not supported`);
    }
    return type;
}