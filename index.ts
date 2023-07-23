import {Command} from 'commander';
import fs from 'fs';
import {resolve} from 'path';
import Knex from 'knex';
import mapType from "./mapType";

const program = new Command();

program
    .option('-h, --host <type>', 'database host')
    .option('-d, --database <type>', 'database name')
    .option('-u, --user <type>', 'database user')
    .option('-p, --password <type>', 'database password')
    .option('-t, --table <type>', 'table name')
    .option('-o, --output <type>', 'output path')
    .option('-f, --filename <type>', 'output file name')
    .action(async (cmdObj) => {
        let {host, database, user, password, table, output, filename} = cmdObj;

        // Initiate knex instance
        const knex = Knex({
            client: 'mysql',
            connection: {
                host: host,
                user: user,
                password: password,
                database: database
            }
        });

        // Fetch table columns
        const columns = await knex('INFORMATION_SCHEMA.COLUMNS')
            .select('COLUMN_NAME', 'DATA_TYPE')
            .where({'TABLE_NAME': table, 'TABLE_SCHEMA': database});

        // Fetch primary key information
        const primaryKeys = await knex('INFORMATION_SCHEMA.KEY_COLUMN_USAGE')
            .select('COLUMN_NAME')
            .where({'TABLE_NAME': table, 'CONSTRAINT_NAME': 'PRIMARY', 'TABLE_SCHEMA': database});

        // Fetch index information
        const indexes = await knex('INFORMATION_SCHEMA.STATISTICS')
            .distinct('INDEX_NAME')
            .where({'TABLE_NAME': table, 'TABLE_SCHEMA': database});

        // Fetch foreign key information
        const foreignKeys = await knex('INFORMATION_SCHEMA.KEY_COLUMN_USAGE')
            .select('COLUMN_NAME', 'REFERENCED_TABLE_NAME', 'REFERENCED_COLUMN_NAME')
            .where({'TABLE_NAME': table, 'TABLE_SCHEMA': database})
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
        } else {
            if (!fs.existsSync(output)) {
                fs.mkdirSync(output);
            }
        }

        // Write class to file
        const outputPath = resolve(output, `${filename}.ts`);
        fs.writeFileSync(outputPath, outputClass);

        console.log(`Class written to ${outputPath}`);
        process.exit();
    });

program.parse(process.argv);
