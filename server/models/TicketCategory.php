<?php

class TicketCategory
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function getAllActive()
    {
        $stmt = $this->pdo->query("SELECT * FROM ticket_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAll()
    {
        $stmt = $this->pdo->query("SELECT * FROM ticket_categories ORDER BY display_order ASC, name ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM ticket_categories WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data)
    {
        $sql = "INSERT INTO ticket_categories 
                (category_key, name, icon, color, bg_color, border_color, description, display_order, is_active) 
                VALUES 
                (:category_key, :name, :icon, :color, :bg_color, :border_color, :description, :display_order, :is_active)";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'category_key' => $data['category_key'],
            'name' => $data['name'],
            'icon' => $data['icon'] ?? 'HelpCircle',
            'color' => $data['color'] ?? 'text-blue-400',
            'bg_color' => $data['bg_color'] ?? 'bg-blue-500/10',
            'border_color' => $data['border_color'] ?? 'border-blue-500/30',
            'description' => $data['description'] ?? null,
            'display_order' => isset($data['display_order']) ? (int)$data['display_order'] : 0,
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);

        return $this->pdo->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE ticket_categories SET 
                    category_key = :category_key,
                    name = :name,
                    icon = :icon,
                    color = :color,
                    bg_color = :bg_color,
                    border_color = :border_color,
                    description = :description,
                    display_order = :display_order,
                    is_active = :is_active
                WHERE id = :id";

        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'category_key' => $data['category_key'],
            'name' => $data['name'],
            'icon' => $data['icon'] ?? 'HelpCircle',
            'color' => $data['color'] ?? 'text-blue-400',
            'bg_color' => $data['bg_color'] ?? 'bg-blue-500/10',
            'border_color' => $data['border_color'] ?? 'border-blue-500/30',
            'description' => $data['description'] ?? null,
            'display_order' => isset($data['display_order']) ? (int)$data['display_order'] : 0,
            'is_active' => isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
    }

    public function delete($id)
    {
        $stmt = $this->pdo->prepare("DELETE FROM ticket_categories WHERE id = :id");
        return $stmt->execute(['id' => $id]);
    }
}
