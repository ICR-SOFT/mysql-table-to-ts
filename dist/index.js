"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// cli.ts
const commander_1 = require("commander");
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const knex_1 = __importDefault(require("knex"));
// MySQL to TypeScript type mapping
const typeMapping = {
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
function mapType(mysqlType) {
    const type = typeMapping[mysqlType];
    if (!type) {
        throw new Error(`Type '${mysqlType}' is not supported`);
    }
    return type;
}
const program = new commander_1.Command();
program
    .option('-h, --host <type>', 'database host')
    .option('-d, --database <type>', 'database name')
    .option('-u, --user <type>', 'database user')
    .option('-p, --password <type>', 'database password')
    .option('-t, --table <type>', 'table name')
    .option('-o, --output <type>', 'output path')
    .option('-f, --filename <type>', 'output file name')
    .action((cmdObj) => __awaiter(void 0, void 0, void 0, function* () {
    let { host, database, user, password, table, output, filename } = cmdObj;
    // Initiate knex instance
    const knex = (0, knex_1.default)({
        client: 'mysql',
        connection: {
            host: host,
            user: user,
            password: password,
            database: database
        }
    });
    // Fetch table columns
    const columns = yield knex('INFORMATION_SCHEMA.COLUMNS')
        .select('COLUMN_NAME', 'DATA_TYPE')
        .where({ 'TABLE_NAME': table, 'TABLE_SCHEMA': database });
    // Fetch primary key information
    const primaryKeys = yield knex('INFORMATION_SCHEMA.KEY_COLUMN_USAGE')
        .select('COLUMN_NAME')
        .where({ 'TABLE_NAME': table, 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': database });
    // Fetch index information
    const indexes = yield knex('INFORMATION_SCHEMA.STATISTICS')
        .distinct('INDEX_NAME')
        .where({ 'TABLE_NAME': table, 'TABLE_SCHEMA': database });
    // Fetch foreign key information
    const foreignKeys = yield knex('INFORMATION_SCHEMA.KEY_COLUMN_USAGE')
        .select('COLUMN_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME')
        .where({ 'TABLE_NAME': table, 'TABLE_SCHEMA': database })
        .whereNotNull('REFERENCED_TABLE_NAME');
    let outputClass = `class ${table.charAt(0).toUpperCase() + table.slice(1)} {\n`;
    for (let column of columns) {
        // If it is a foreign key, append ForeignKey suffix to type
        // const isForeignKey = foreignKeys.some(fk => fk.COLUMN_NAME === column.COLUMN_NAME);
        let columnType = mapType(column.DATA_TYPE);
        // if (isForeignKey) columnType += 'ForeignKey';
        outputClass += `  ${column.COLUMN_NAME}: ${columnType};\n`;
    }
    outputClass += `  primaryKeys: ${JSON.stringify(primaryKeys.map(pk => pk.COLUMN_NAME))};\n`;
    outputClass += `  indexes: ${JSON.stringify(indexes.map(idx => idx.INDEX_NAME))};\n`;
    outputClass += `  foreignKeys: ${JSON.stringify(foreignKeys.map(fk => fk.COLUMN_NAME))};\n`;
    outputClass += '}\n';
    // If output path not exists, create it
    if (!output) {
        output = './';
    }
    else {
        if (!fs_1.default.existsSync(output)) {
            fs_1.default.mkdirSync(output);
        }
    }
    // Write class to file
    const outputPath = (0, path_1.resolve)(output, `${filename}.ts`);
    fs_1.default.writeFileSync(outputPath, outputClass);
    console.log(`Class written to ${outputPath}`);
    process.exit();
}));
program.parse(process.argv);
