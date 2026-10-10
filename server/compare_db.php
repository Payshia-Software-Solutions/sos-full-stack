<?php
try {
    $local_pdo = new PDO("mysql:host=127.0.0.1;dbname=pharmaco_pharmacollege", "root", "");
    $local_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $live_pdo = new PDO("mysql:host=91.204.209.19;port=3306;dbname=pharmaco_pharmacollege", "pharmaco_admin", "pharmaadmin");
    $live_pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $local_tables_stmt = $local_pdo->query("SHOW TABLES");
    $local_tables = $local_tables_stmt->fetchAll(PDO::FETCH_COLUMN);

    $live_tables_stmt = $live_pdo->query("SHOW TABLES");
    $live_tables = $live_tables_stmt->fetchAll(PDO::FETCH_COLUMN);

    $missing_tables = array_diff($local_tables, $live_tables);

    $column_diffs = [];

    foreach ($local_tables as $table) {
        if (in_array($table, $live_tables)) {
            $local_cols_stmt = $local_pdo->query("DESCRIBE `$table`");
            $local_cols = $local_cols_stmt->fetchAll(PDO::FETCH_ASSOC);

            $live_cols_stmt = $live_pdo->query("DESCRIBE `$table`");
            $live_cols = $live_cols_stmt->fetchAll(PDO::FETCH_ASSOC);

            $local_col_names = array_column($local_cols, 'Field');
            $live_col_names = array_column($live_cols, 'Field');

            $missing_cols = array_diff($local_col_names, $live_col_names);

            if (!empty($missing_cols)) {
                $column_diffs[$table] = [];
                foreach ($missing_cols as $col_name) {
                    $def = array_values(array_filter($local_cols, function($c) use ($col_name) { return $c['Field'] === $col_name; }))[0];
                    $column_diffs[$table][] = $def;
                }
            }
        }
    }

    echo json_encode([
        'missing_tables' => array_values($missing_tables),
        'missing_columns' => $column_diffs
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
