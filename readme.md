## MySQL to TypeScript Class CLI

This CLI tool generates TypeScript classes based on the structure of a MySQL table. The resulting classes include information about primary keys, indexes, and foreign keys, allowing you to leverage this information in your TypeScript project.

### Installation

To install the CLI tool, run the following npm command:

```bash
npm install -g mysql-to-ts-class-cli
```

### Usage

To run the CLI tool, use a command in the following format:

```bash
mysql-to-ts-class-cli --host <host> --database <database> --user <user> --password <password> --table <table> --output <output path> --filename <output filename>
```

Option descriptions:

- host: Specifies the host of the MySQL database.
- database: Specifies the name of the MySQL database to use.
- user: Specifies the username to connect to the database.
- password: Specifies the password of the user to connect to the database.
- table: Specifies the name of the MySQL table for which you want to generate a TypeScript class.
- output: Specifies the directory path where the generated TypeScript class file will be stored.
- filename: Specifies the name of the generated TypeScript class file. (Excluding extension)

### Example
```bash
mysql-to-ts-class-cli --host localhost --database myDB --user myUser --password myPassword --table myTable --output ./models --filename myTableModel
```

The above command connects to the myDB database located at localhost using myUser and myPassword, generates a TypeScript class based on the structure of the myTable table, and saves the file as ./models/myTableModel.ts.

### Example Output

Given a table structure as follows:

```sql
CREATE TABLE `myTable` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

The resulting TypeScript class would be:

```typescript
class MyTable {
    id: number;
    name: string;
    created_at: Date;
    primaryKeys: ["id"];
    indexes: ["name"];
    foreignKeys: [];
}
```